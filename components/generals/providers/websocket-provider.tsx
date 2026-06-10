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

    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.close()
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token, role }))
    }

    ws.onmessage = (event) => {
      let msg: WsMessage
      try { msg = JSON.parse(event.data as string) } catch { return }

      if (msg.type === 'auth_success') {
        attemptRef.current = 0
        setIsConnected(true)
        heartbeatRef.current = setInterval(() => send({ type: 'heartbeat' }), 30_000)
      } else if (msg.type === 'auth_error') {
        if (msg.error?.code === 'EXPIRED_TOKEN') {
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
      if (!mountedRef.current) return
      setIsConnected(false)
      stopHeartbeat()
      if (isRefreshingRef.current) return
      const delay = Math.min(Math.pow(2, attemptRef.current) * 1000, 30_000)
      attemptRef.current++
      reconnectRef.current = setTimeout(() => connect(token, role), delay)
    }

    ws.onerror = () => ws.close()
  }, [send, stopHeartbeat])

  useEffect(() => {
    const token = session?.user?.accessToken
    const role = session?.user?.userType
    if (!token || !role) return
    mountedRef.current = true
    connect(token, role)
    return () => {
      mountedRef.current = false
      if (reconnectRef.current !== null) clearTimeout(reconnectRef.current)
      stopHeartbeat()
      wsRef.current?.close()
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
