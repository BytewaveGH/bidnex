'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

type WsMessage = Record<string, any>
type Unsubscribe = () => void

type WebSocketContextType = {
  subscribe: (handler: (msg: WsMessage) => void) => Unsubscribe
  send: (msg: WsMessage) => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8001/api/websocket/connect'
const HEARTBEAT_INTERVAL = 30_000
const MAX_RECONNECT_DELAY = 30_000

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const listenersRef = useRef<Set<(msg: WsMessage) => void>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const attemptRef = useRef(0)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const updateRef = useRef(update)
  // Generation counter: each new connect() call gets a unique ID.
  // Stale onclose/onerror callbacks check this and bail out if they're no longer current.
  const genRef = useRef(0)

  useEffect(() => { updateRef.current = update })

  const send = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  const subscribe = useCallback((handler: (msg: WsMessage) => void): Unsubscribe => {
    listenersRef.current.add(handler)
    return () => listenersRef.current.delete(handler)
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current !== null) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  const connect = useCallback((token: string, role: string) => {
    if (!mountedRef.current) return
    if (reconnectRef.current !== null) { clearTimeout(reconnectRef.current); reconnectRef.current = null }

    // Close any existing socket cleanly, without triggering its onclose reconnect logic
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.close()
    }

    // Bump generation — any in-flight callbacks from prior sockets will see a stale gen and bail
    const gen = ++genRef.current
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      if (gen !== genRef.current) { ws.close(); return }
      ws.send(JSON.stringify({ type: 'auth', token, role }))
    }

    ws.onmessage = (event) => {
      if (gen !== genRef.current) return
      let msg: WsMessage
      try { msg = JSON.parse(event.data as string) } catch { return }

      if (msg.type === 'auth_success') {
        attemptRef.current = 0
        setIsConnected(true)
        stopHeartbeat()
        heartbeatRef.current = setInterval(() => send({ type: 'heartbeat' }), HEARTBEAT_INTERVAL)
      } else if (msg.type === 'auth_error') {
        if (msg.error?.code === 'EXPIRED_TOKEN' && !isRefreshingRef.current) {
          isRefreshingRef.current = true
          updateRef.current().finally(() => { isRefreshingRef.current = false })
        }
        ws.close()
        return
      } else if (msg.type === 'connection_timeout') {
        ws.close()
        return
      }

      listenersRef.current.forEach(h => h(msg))
    }

    ws.onclose = () => {
      // Discard if this is a stale socket or component unmounted
      if (gen !== genRef.current || !mountedRef.current) return
      setIsConnected(false)
      stopHeartbeat()
      if (isRefreshingRef.current) return
      // Exponential backoff with jitter
      const base = Math.min(Math.pow(2, attemptRef.current) * 1000, MAX_RECONNECT_DELAY)
      const delay = base + Math.random() * 1000
      attemptRef.current++
      reconnectRef.current = setTimeout(() => connect(token, role), delay)
    }

    ws.onerror = () => {
      if (gen !== genRef.current) return
      ws.close()
    }
  }, [send, stopHeartbeat])

  useEffect(() => {
    const token = session?.user?.accessToken
    const role = session?.user?.userType
    if (!token || !role) return
    mountedRef.current = true
    connect(token, role)
    return () => {
      mountedRef.current = false
      genRef.current++ // invalidate any in-flight callbacks
      if (reconnectRef.current !== null) clearTimeout(reconnectRef.current)
      stopHeartbeat()
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.close()
      }
    }
  }, [session?.user?.accessToken, session?.user?.userType])

  return (
    <WebSocketContext.Provider value={{ subscribe, send, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useWebSocket must be used inside WebSocketProvider')
  return ctx
}
