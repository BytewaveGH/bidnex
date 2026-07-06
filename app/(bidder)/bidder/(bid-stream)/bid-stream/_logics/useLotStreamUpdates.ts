'use client'

import { useEffect, useRef } from 'react'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'
import { useWebSocket } from '@/components/generals/providers/websocket-provider'
import type { StreamLot } from './stream-types'

const POLL_INTERVAL_MS = 10_000
// Disabled for now — the REST fallback poll was hitting GET /public/lots/{id}
// too much. WebSocket-driven updates (below) are unaffected. Flip this back
// on once we're ready to re-enable the polling fallback.
const POLLING_ENABLED = false

/**
 * Keeps the currently-active card's bid state fresh. Prefers the app's
 * websocket feed (joins the lot's auction room and listens for bid
 * broadcasts) and only falls back to polling GET /public/lots/{id} every
 * 10s when the socket isn't connected.
 */
export function useLotStreamUpdates(
  activeLot: StreamLot | undefined,
  onUpdate: (lotId: number, patch: Partial<StreamLot>) => void,
) {
  const callApi = useUnauthenticatedAxios()
  const { subscribe, joinAuction, isConnected } = useWebSocket()

  // `useUnauthenticatedAxios()`/`onUpdate` (patchLot) aren't referentially
  // stable across renders, and patching a lot after every poll re-renders
  // the parent — without this, the poll interval below would tear down and
  // restart on every one of those unrelated renders instead of holding a
  // steady 10s cadence for the active lot.
  const callApiRef = useRef(callApi)
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    callApiRef.current = callApi
    onUpdateRef.current = onUpdate
  })

  const lotId = activeLot?.id
  const auctionId = activeLot?.auctionId

  useEffect(() => {
    if (!isConnected || lotId === undefined || auctionId == null) return

    const leaveAuction = joinAuction(String(auctionId))
    const unsubscribe = subscribe((msg) => {
      if (msg.type !== 'auction_update' || !msg.data) return
      const data = msg.data
      if (data.lotId !== lotId) return

      if (data.type === 'lot_sold') {
        onUpdateRef.current(lotId, {
          status: 'sold',
          currentBid: data.soldPrice ?? undefined,
        })
        return
      }

      if (data.currentBid !== undefined) {
        onUpdateRef.current(lotId, {
          currentBid: data.currentBid,
          bidCount: data.bidCount ?? undefined,
          bidEndTime: data.endTime ?? undefined,
        })
      }
    })

    return () => {
      leaveAuction()
      unsubscribe()
    }
  }, [isConnected, lotId, auctionId, joinAuction, subscribe])

  useEffect(() => {
    if (!POLLING_ENABLED || isConnected || lotId === undefined) return

    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res: any = await callApiRef.current({ method: 'GET', url: `/public/lots/${lotId}` })
        if (cancelled || res.status >= 400) return
        const lot = res.data?.data as StreamLot | undefined
        if (!lot) return
        onUpdateRef.current(lotId, {
          currentBid: lot.currentBid,
          bidCount: lot.bidCount,
          status: lot.status,
          bidEndTime: lot.bidEndTime,
        })
      } catch {
        // transient network hiccup — the next tick will retry
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isConnected, lotId])
}
