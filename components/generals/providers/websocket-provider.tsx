'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getWebSocketClient, resetWebSocketClient, type WsMessage } from '@/lib/websocket/ws-client'

type Unsubscribe = () => void

type WebSocketContextType = {
  subscribe: (handler: (msg: WsMessage) => void) => Unsubscribe
  send: (msg: WsMessage) => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const updateRef = useRef(update)
  const clientRef = useRef(getWebSocketClient())

  useEffect(() => {
    updateRef.current = update
  }, [update])

  useEffect(() => {
    const client = clientRef.current
    client.init({ onTokenRefresh: () => updateRef.current() })
    const unsubConnection = client.onConnectionChange(setIsConnected)
    return () => {
      unsubConnection()
      resetWebSocketClient()
    }
  }, [])

  useEffect(() => {
    const token = session?.user?.accessToken
    const role = session?.user?.userType
    const client = clientRef.current

    if (!token || !role) {
      client.setCredentials(null)
      return
    }

    client.setCredentials({ token, role })
  }, [session?.user?.accessToken, session?.user?.userType])

  const subscribe = useCallback((handler: (msg: WsMessage) => void) => {
    return clientRef.current.subscribe(handler)
  }, [])

  const send = useCallback((msg: WsMessage) => {
    clientRef.current.send(msg)
  }, [])

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
