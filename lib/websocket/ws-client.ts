import { TabLeader, TabRelay } from './tab-leader'

export type WsMessage = Record<string, any>
export type WsHandler = (msg: WsMessage) => void
export type WsCredentials = { token: string; role: string }
export type TokenRefresher = () => Promise<{ user?: { accessToken?: string } } | null | undefined>

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8001/api/websocket/connect'
const HEARTBEAT_INTERVAL_MS = 30_000
const HEARTBEAT_ACK_TIMEOUT_MS = 10_000
const MAX_RECONNECT_DELAY_MS = 30_000
const CLOSE_SETTLE_MS = 300

let clientInstance: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!clientInstance) clientInstance = new WebSocketClient()
  return clientInstance
}

export function resetWebSocketClient() {
  clientInstance?.destroy()
  clientInstance = null
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private state: ConnectionState = 'idle'
  private credentials: WsCredentials | null = null
  private listeners = new Set<WsHandler>()
  private connectionListeners = new Set<(connected: boolean) => void>()
  private generation = 0
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatAckTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatAckSupported = false
  private tokenRefresher: TokenRefresher | null = null
  private refreshInFlight = false
  private wasKicked = false
  private intentionalClose = false
  private tabLeader: TabLeader | null = null
  private tabRelay: TabRelay | null = null
  private isLeader = false
  private initialized = false
  private auctionRoomRefs = new Map<string, number>()

  init(options: { onTokenRefresh: TokenRefresher }) {
    if (this.initialized) return
    this.initialized = true
    this.tokenRefresher = options.onTokenRefresh

    this.tabRelay = new TabRelay(
      (payload) => this.dispatch(payload),
      (payload) => {
        if (this.isLeader) this.sendRaw(payload)
      },
      (connected) => {
        if (!this.isLeader) this.setState(connected ? 'connected' : 'idle')
      },
      () => {
        if (this.isLeader) this.tabRelay?.broadcastConnection(this.state === 'connected')
      },
    )

    this.tabLeader = new TabLeader({
      onBecomeLeader: () => {
        this.isLeader = true
        this.wasKicked = false
        void this.ensureConnected()
      },
      onLoseLeader: () => {
        this.isLeader = false
        this.disconnect({ intentional: true })
      },
    })

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange)
    }
  }

  destroy() {
    if (!this.initialized) return
    this.initialized = false
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.tabLeader?.destroy()
    this.tabLeader = null
    this.tabRelay?.destroy()
    this.tabRelay = null
    this.disconnect({ intentional: true })
    this.listeners.clear()
    this.connectionListeners.clear()
    this.credentials = null
  }

  private onVisibilityChange = () => {
    if (document.visibilityState !== 'visible' || !this.isLeader) return

    if (this.state === 'connected') {
      // The socket may be a "zombie" — readyState still OPEN but the underlying
      // connection silently died while the tab was backgrounded/asleep. Probe
      // immediately instead of waiting up to HEARTBEAT_INTERVAL_MS for the next tick.
      this.sendHeartbeatProbe()
      return
    }

    this.wasKicked = false
    void this.ensureConnected()
  }

  subscribe(handler: WsHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionListeners.add(handler)
    handler(this.state === 'connected')
    return () => this.connectionListeners.delete(handler)
  }

  setCredentials(credentials: WsCredentials | null) {
    if (!credentials) {
      this.credentials = null
      this.disconnect({ intentional: true })
      return
    }

    const tokenChanged = this.credentials?.token !== credentials.token
    const roleChanged = this.credentials?.role !== credentials.role
    this.credentials = credentials

    if (!this.isLeader) {
      this.tabRelay?.requestState()
      return
    }

    if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      if (tokenChanged || roleChanged) this.reauthenticate()
      return
    }

    if (this.state === 'connecting') return

    void this.ensureConnected()
  }

  send(msg: WsMessage) {
    if (this.isLeader) {
      this.sendRaw(msg)
      return
    }
    this.tabRelay?.requestSend(msg)
  }

  /** Ref-counted auction room membership — safe to call from multiple hook instances
   *  wanting the same auctionId at once. Returns a leave function. */
  joinAuction(auctionId: string): () => void {
    const count = this.auctionRoomRefs.get(auctionId) ?? 0
    this.auctionRoomRefs.set(auctionId, count + 1)
    if (count === 0) this.send({ type: 'join_auction', auctionId })

    let left = false
    return () => {
      if (left) return
      left = true
      const remaining = (this.auctionRoomRefs.get(auctionId) ?? 1) - 1
      if (remaining <= 0) {
        this.auctionRoomRefs.delete(auctionId)
        this.send({ type: 'leave_auction', auctionId })
      } else {
        this.auctionRoomRefs.set(auctionId, remaining)
      }
    }
  }

  private replayAuctionRooms() {
    for (const auctionId of this.auctionRoomRefs.keys()) {
      this.sendRaw({ type: 'join_auction', auctionId })
    }
  }

  private sendRaw(msg: WsMessage) {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(msg))
  }

  private reauthenticate() {
    if (!this.credentials || this.ws?.readyState !== WebSocket.OPEN) return
    this.sendRaw({ type: 'auth', token: this.credentials.token, role: this.credentials.role })
  }

  private async ensureConnected() {
    if (!this.initialized || !this.isLeader || !this.credentials) return
    if (this.state === 'connecting' || this.state === 'connected') return
    if (this.wasKicked) return

    this.clearReconnect()
    await this.openConnection()
  }

  private disconnect({ intentional }: { intentional: boolean }) {
    this.intentionalClose = intentional
    this.clearReconnect()
    this.stopHeartbeat()
    this.closeSocket()
    this.setState('idle')
    if (intentional) this.reconnectAttempt = 0
  }

  private async openConnection() {
    if (!this.credentials || !this.isLeader) return

    this.setState('connecting')
    this.intentionalClose = false
    this.stopHeartbeat()

    await this.closeSocketAndWait()

    if (!this.credentials || !this.isLeader) {
      this.setState('idle')
      return
    }

    const gen = ++this.generation
    const { token, role } = this.credentials
    const ws = new WebSocket(WS_URL)
    this.ws = ws

    ws.onopen = () => {
      if (gen !== this.generation) return
      ws.send(JSON.stringify({ type: 'auth', token, role }))
    }

    ws.onmessage = (event) => {
      if (gen !== this.generation) return
      void this.handleMessage(event.data as string, gen)
    }

    ws.onclose = () => {
      if (gen !== this.generation) return
      this.handleClose()
    }

    ws.onerror = () => {
      if (gen !== this.generation) return
      ws.close()
    }
  }

  private async handleMessage(raw: string, gen: number) {
    let msg: WsMessage
    try {
      msg = JSON.parse(raw) as WsMessage
    } catch {
      return
    }

    if (msg.type === 'auth_success') {
      this.reconnectAttempt = 0
      this.wasKicked = false
      this.setState('connected')
      this.startHeartbeat(gen)
      this.replayAuctionRooms()
      return
    }

    if (msg.type === 'heartbeat_ack') {
      this.heartbeatAckSupported = true
      this.clearHeartbeatAckTimer()
      return
    }

    if (msg.type === 'kicked') {
      this.wasKicked = true
      this.stopHeartbeat()
      this.setState('idle')
      this.closeSocket()
      return
    }

    if (msg.type === 'auth_error') {
      const code = (msg.error as { code?: string } | undefined)?.code
      if (code === 'TOKEN_EXPIRING' || code === 'EXPIRED_TOKEN') {
        await this.refreshTokenAndReauth(gen)
        return
      }
      // Not a transient/idle condition (bad credentials) — don't auto-reconnect
      // with the same doomed token, unlike connection_timeout below.
      this.stopHeartbeat()
      this.setState('idle')
      this.closeSocket()
      return
    }

    if (msg.type === 'connection_timeout') {
      // Server-initiated idle close — this is recoverable, unlike auth_error, so
      // route it through the same path as a dropped connection instead of just
      // going idle forever.
      this.closeSocket()
      this.onConnectionLost()
      return
    }

    this.dispatch(msg)
    if (this.isLeader) this.tabRelay?.broadcastMessage(msg)
  }

  private async refreshTokenAndReauth(gen: number) {
    if (this.refreshInFlight || !this.tokenRefresher) return
    this.refreshInFlight = true
    try {
      const updated = await this.tokenRefresher()
      if (gen !== this.generation) return
      const newToken = updated?.user?.accessToken
      if (!newToken || !this.credentials) return

      this.credentials = { ...this.credentials, token: newToken }
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.reauthenticate()
      }
    } finally {
      this.refreshInFlight = false
    }
  }

  private handleClose() {
    this.onConnectionLost()
  }

  /** Shared teardown for "the connection is gone" — whether we learned that from
   *  the socket's own close event, or detected it ourselves (zombie connection,
   *  server-side idle timeout notice). */
  private onConnectionLost() {
    if (this.ws) this.ws = null
    this.stopHeartbeat()
    this.setState('idle')

    if (this.intentionalClose || this.wasKicked || !this.isLeader || !this.credentials) return

    this.scheduleReconnect()
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return
    this.setState('reconnecting')

    const delay = Math.min(2 ** this.reconnectAttempt * 1000, MAX_RECONNECT_DELAY_MS) + Math.random() * 500
    this.reconnectAttempt++

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.openConnection()
    }, delay)
  }

  private clearReconnect() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(gen: number) {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => this.tickHeartbeat(gen), HEARTBEAT_INTERVAL_MS)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatAckTimer()
  }

  private clearHeartbeatAckTimer() {
    if (this.heartbeatAckTimer !== null) {
      clearTimeout(this.heartbeatAckTimer)
      this.heartbeatAckTimer = null
    }
  }

  /** Fires an out-of-band heartbeat immediately (e.g. on tab visibility regain)
   *  instead of waiting for the next scheduled interval tick. */
  private sendHeartbeatProbe() {
    this.tickHeartbeat(this.generation)
  }

  private tickHeartbeat(gen: number) {
    if (gen !== this.generation || this.state !== 'connected') return
    if (this.ws?.readyState !== WebSocket.OPEN) return

    this.sendRaw({ type: 'heartbeat', ts: Date.now() })

    this.clearHeartbeatAckTimer()
    this.heartbeatAckTimer = setTimeout(() => {
      // Only enforce once we've seen the backend actually reply at least once —
      // until then this is a no-op so behavior is unchanged against a backend
      // that doesn't yet implement heartbeat_ack.
      if (!this.heartbeatAckSupported) return
      if (gen !== this.generation) return
      this.handleZombieConnection(gen)
    }, HEARTBEAT_ACK_TIMEOUT_MS)
  }

  /** The socket's readyState still reports OPEN and no close/error event has fired,
   *  but the server hasn't acked a heartbeat within the timeout — treat it as dead
   *  rather than waiting indefinitely for a close event that may never arrive. */
  private handleZombieConnection(gen: number) {
    if (gen !== this.generation) return
    this.generation++

    const ws = this.ws
    this.ws = null
    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      try { ws.close() } catch { /* best-effort only */ }
    }

    this.onConnectionLost()
  }

  private closeSocket() {
    const ws = this.ws
    if (!ws) return
    this.ws = null
    ws.onopen = null
    ws.onmessage = null
    ws.onclose = null
    ws.onerror = null
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  }

  private closeSocketAndWait(): Promise<void> {
    const ws = this.ws
    if (!ws) return Promise.resolve()

    return new Promise((resolve) => {
      if (ws.readyState === WebSocket.CLOSED) {
        this.ws = null
        resolve()
        return
      }

      const finish = () => {
        this.ws = null
        setTimeout(resolve, CLOSE_SETTLE_MS)
      }

      ws.onclose = finish
      ws.onerror = finish
      ws.close()

      setTimeout(finish, 1_000)
    })
  }

  private setState(state: ConnectionState) {
    this.state = state
    const connected = state === 'connected'
    this.connectionListeners.forEach((handler) => handler(connected))
    if (this.isLeader) this.tabRelay?.broadcastConnection(connected)
  }

  private dispatch(msg: WsMessage) {
    this.listeners.forEach((handler) => handler(msg))
  }
}
