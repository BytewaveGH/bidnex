const LEADER_KEY = 'bidnex:ws-leader'
const LEADER_TTL_MS = 4_000
const LEADER_HEARTBEAT_MS = 2_000

type LeaderRecord = { id: string; ts: number }

export type TabLeaderCallbacks = {
  onBecomeLeader: () => void
  onLoseLeader: () => void
}

function readLeader(): LeaderRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LEADER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LeaderRecord
  } catch {
    return null
  }
}

function writeLeader(id: string) {
  localStorage.setItem(LEADER_KEY, JSON.stringify({ id, ts: Date.now() }))
}

export class TabLeader {
  readonly tabId: string
  private isLeader = false
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private checkTimer: ReturnType<typeof setInterval> | null = null
  private callbacks: TabLeaderCallbacks
  private channel: BroadcastChannel | null = null

  constructor(callbacks: TabLeaderCallbacks) {
    this.tabId = typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now())
    this.callbacks = callbacks

    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('bidnex:ws-leader')
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'leader_claimed' && event.data.tabId !== this.tabId) {
          this.relinquish(false)
        }
      }
    }

    this.tryClaim()
    this.checkTimer = setInterval(() => this.tryClaim(), LEADER_HEARTBEAT_MS)
  }

  get leading() {
    return this.isLeader
  }

  private tryClaim() {
    if (typeof window === 'undefined') return

    const now = Date.now()
    const current = readLeader()
    const expired = !current || now - current.ts > LEADER_TTL_MS
    const ownsLock = current?.id === this.tabId

    if (expired || ownsLock) {
      writeLeader(this.tabId)
      const confirmed = readLeader()
      if (confirmed?.id === this.tabId && !this.isLeader) {
        this.isLeader = true
        this.channel?.postMessage({ type: 'leader_claimed', tabId: this.tabId })
        this.startHeartbeat()
        this.callbacks.onBecomeLeader()
      }
      return
    }

    if (this.isLeader && current.id !== this.tabId) {
      this.relinquish(false)
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (!this.isLeader) return
      writeLeader(this.tabId)
    }, LEADER_HEARTBEAT_MS)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private relinquish(notify: boolean) {
    if (!this.isLeader) return
    this.isLeader = false
    this.stopHeartbeat()
    if (notify) this.callbacks.onLoseLeader()
  }

  destroy() {
    if (this.checkTimer !== null) clearInterval(this.checkTimer)
    this.stopHeartbeat()
    if (this.isLeader) {
      const current = readLeader()
      if (current?.id === this.tabId) localStorage.removeItem(LEADER_KEY)
    }
    this.channel?.close()
    this.relinquish(true)
  }
}

export type RelayMessage =
  | { type: 'ws_message'; payload: Record<string, unknown> }
  | { type: 'ws_send'; payload: Record<string, unknown> }
  | { type: 'ws_connected'; connected: boolean }
  | { type: 'ws_request_state' }

export class TabRelay {
  private channel: BroadcastChannel | null = null
  private onMessage: (payload: Record<string, unknown>) => void
  private onSend: (payload: Record<string, unknown>) => void
  private onConnection: (connected: boolean) => void
  private onRequestState: () => void

  constructor(
    onMessage: (payload: Record<string, unknown>) => void,
    onSend: (payload: Record<string, unknown>) => void,
    onConnection: (connected: boolean) => void,
    onRequestState: () => void,
  ) {
    this.onMessage = onMessage
    this.onSend = onSend
    this.onConnection = onConnection
    this.onRequestState = onRequestState
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('bidnex:ws-relay')
      this.channel.onmessage = (event: MessageEvent<RelayMessage>) => {
        if (event.data?.type === 'ws_message') this.onMessage(event.data.payload)
        if (event.data?.type === 'ws_send') this.onSend(event.data.payload)
        if (event.data?.type === 'ws_connected') this.onConnection(event.data.connected)
        if (event.data?.type === 'ws_request_state') this.onRequestState()
      }
    }
  }

  broadcastMessage(payload: Record<string, unknown>) {
    this.channel?.postMessage({ type: 'ws_message', payload } satisfies RelayMessage)
  }

  broadcastConnection(connected: boolean) {
    this.channel?.postMessage({ type: 'ws_connected', connected } satisfies RelayMessage)
  }

  requestSend(payload: Record<string, unknown>) {
    this.channel?.postMessage({ type: 'ws_send', payload } satisfies RelayMessage)
  }

  requestState() {
    this.channel?.postMessage({ type: 'ws_request_state' } satisfies RelayMessage)
  }

  destroy() {
    this.channel?.close()
  }
}
