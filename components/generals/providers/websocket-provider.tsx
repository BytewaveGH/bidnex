'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getWebSocketClient, resetWebSocketClient, type WsMessage } from '@/lib/websocket/ws-client'

type Unsubscribe = () => void

type WebSocketContextType = {
  subscribe: (handler: (msg: WsMessage) => void) => Unsubscribe
  send: (msg: WsMessage) => void
  joinAuction: (auctionId: string) => Unsubscribe
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

    if (!token || role !== 'bidder') {
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

  const joinAuction = useCallback((auctionId: string) => {
    return clientRef.current.joinAuction(auctionId)
  }, [])

  return (
    <WebSocketContext.Provider value={{ subscribe, send, joinAuction, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useWebSocket must be used inside WebSocketProvider')
  return ctx
}

/**
 * Fires `onReconnect` on every isConnected false->true transition, skipping the
 * very first connect since that data is already fresh from the initial fetch.
 * Used to resync REST state after a dropped connection comes back.
 */
export function useResyncOnReconnect(onReconnect: () => void) {
  const { isConnected } = useWebSocket()
  const hasConnectedOnceRef = useRef(false)
  const onReconnectRef = useRef(onReconnect)

  useEffect(() => {
    onReconnectRef.current = onReconnect
  })

  useEffect(() => {
    if (isConnected && hasConnectedOnceRef.current) onReconnectRef.current()
    if (isConnected) hasConnectedOnceRef.current = true
  }, [isConnected])
}
