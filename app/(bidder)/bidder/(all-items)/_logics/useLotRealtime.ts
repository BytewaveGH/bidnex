'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocket, useResyncOnReconnect } from '@/components/generals/providers/websocket-provider'
import type { AuctionLot } from './auctions'

type RealtimeOverride = {
  currentBid?: number
  bidCount?: number
  bidEndTime?: string
  winnerId?: number | null
  isWinning?: boolean
  isOutbid?: boolean
  isClosed?: boolean
  isWon?: boolean
  antiSniped?: boolean
}

type AuctionOverride = { isClosed: boolean }

export type RealtimeLot = AuctionLot & {
  isWinning: boolean
  isOutbid: boolean
  isClosed: boolean
  isWon: boolean
  antiSniped: boolean
  suggestedBid: number
}

function useLotRealtimeCore(lots: AuctionLot[]) {
  const { subscribe, joinAuction } = useWebSocket()
  const { data: session } = useSession()
  const currentUserId = Number((session?.user as any)?.userId)

  const [lotUpdates, setLotUpdates] = useState<Map<number, RealtimeOverride>>(new Map())
  const [auctionUpdates, setAuctionUpdates] = useState<Map<number, AuctionOverride>>(new Map())

  // Join a room for every auction currently represented in `lots` so onlookers
  // (and the bidder themself, on grid/list views) receive live bid_placed /
  // lot_sold broadcasts for it — previously only the single-lot product page
  // ever joined a room, so every grid view was deaf to public broadcasts.
  const auctionIds = useMemo(
    () => Array.from(new Set(lots.map(l => l.auctionId).filter((id): id is number => id != null))),
    [lots],
  )
  const auctionIdsKey = auctionIds.join(',')
  useEffect(() => {
    const leaves = auctionIds.map(id => joinAuction(String(id)))
    return () => leaves.forEach(leave => leave())
    // auctionIdsKey mirrors auctionIds' contents; joinAuction is stable from the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionIdsKey, joinAuction])

  // Anything missed while disconnected is gone until we clear stale overrides and
  // let fresh REST data (refetched by the resync hooks on the data-fetching side)
  // take over again.
  useResyncOnReconnect(() => {
    setLotUpdates(new Map())
    setAuctionUpdates(new Map())
  })

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === 'auction_update') {
        const data = msg.data
        if (!data) return

        // Outbid broadcast on the public channel (legacy shape — kept alongside the
        // user_event check below since we've seen the live server use either)
        if (data.type === 'outbid' && data.userId === currentUserId) {
          setLotUpdates(prev => {
            const next = new Map(prev)
            const ex = next.get(data.lotId) ?? {}
            next.set(data.lotId, { ...ex, currentBid: data.amount ?? ex.currentBid, isOutbid: true, isWinning: false })
            return next
          })
          return
        }

        // Buy Now purchase — lot closes immediately for everyone watching
        if (data.type === 'lot_sold' && data.lotId !== undefined) {
          setLotUpdates(prev => {
            const next = new Map(prev)
            const ex = next.get(data.lotId) ?? {}
            next.set(data.lotId, {
              ...ex,
              currentBid: data.soldPrice ?? ex.currentBid,
              winnerId: data.winnerId,
              isClosed: true,
            })
            return next
          })
          return
        }

        // Bid placed — manual or proxy counter-bid. The live server doesn't reliably
        // send a `type` discriminator here, so detect by field presence instead.
        if (data.lotId !== undefined && data.currentBid !== undefined) {
          const { lotId, currentBid, bidCount, endTime, antiSniped } = data
          const winnerId = data.winnerId ?? data.bidderId
          const lot = lots.find(l => l.id === lotId)
          const hadBid = lot?.bidderIds?.includes(currentUserId) ?? false
          const nowWinning = winnerId === currentUserId

          setLotUpdates(prev => {
            const next = new Map(prev)
            const ex = next.get(lotId) ?? {}
            const wasWinning = ex.isWinning ?? false
            const nowOutbid = (wasWinning || hadBid) && winnerId !== currentUserId
            next.set(lotId, {
              ...ex,
              currentBid,
              bidCount,
              bidEndTime: endTime,
              winnerId,
              isWinning: nowWinning,
              isOutbid: nowOutbid,
              antiSniped: antiSniped ?? false,
            })
            return next
          })
          return
        }

        // Auction closed
        if (data.lotId === undefined && data.auctionId !== undefined && data.status !== undefined) {
          const closed = data.status === 'ended' || data.status === 'cancelled'
          if (closed) {
            setAuctionUpdates(prev => {
              const next = new Map(prev)
              next.set(Number(data.auctionId), { isClosed: true })
              return next
            })
          }
        }
        return
      }

      // Private notification — only delivered to the affected user
      if (msg.type === 'user_event') {
        const data = msg.data
        const lotId = data?.lotId
        if (lotId === undefined) return

        if (data.type === 'outbid' || msg.event === 'bidder_outbid') {
          const lot = lots.find(l => l.id === lotId)
          setLotUpdates(prev => {
            const next = new Map(prev)
            const existing = next.get(lotId) ?? {}
            next.set(lotId, {
              ...existing,
              currentBid: data.amount ?? existing.currentBid,
              bidCount: (existing.bidCount ?? lot?.bidCount ?? 0) + 1,
              isOutbid: true,
              isWinning: false,
            })
            return next
          })
          return
        }

        // New symmetric counterpart to outbid — private, room-independent "you're
        // now winning" notification. Backend doesn't send this yet; inert until it does.
        if (data.type === 'winning' || msg.event === 'bidder_winning') {
          const lot = lots.find(l => l.id === lotId)
          setLotUpdates(prev => {
            const next = new Map(prev)
            const existing = next.get(lotId) ?? {}
            next.set(lotId, {
              ...existing,
              currentBid: data.amount ?? existing.currentBid,
              bidCount: data.bidCount ?? existing.bidCount ?? lot?.bidCount,
              bidEndTime: data.endTime ?? existing.bidEndTime,
              antiSniped: data.antiSniped ?? existing.antiSniped ?? false,
              isWinning: true,
              isOutbid: false,
            })
            return next
          })
          return
        }

        if (data.type === 'auction_won') {
          setLotUpdates(prev => {
            const next = new Map(prev)
            const existing = next.get(lotId) ?? {}
            next.set(lotId, { ...existing, isWon: true, isWinning: true, isClosed: true })
            return next
          })
        }
      }
    })
  }, [subscribe, lots, currentUserId])

  const cacheRef = useRef(new Map<number, { lot: AuctionLot; realtime: RealtimeLot }>())

  const realtimeLots = useMemo(() => {
    const cache = cacheRef.current

    return lots.map((lot) => {
      const rt = lotUpdates.get(lot.id)
      const auctionClosed = lot.auctionId ? (auctionUpdates.get(lot.auctionId)?.isClosed ?? false) : false

      if (!rt && !auctionClosed) {
        const cached = cache.get(lot.id)
        if (cached?.lot === lot) return cached.realtime
      }

      const currentBid = rt?.currentBid ?? lot.currentBid
      const bidCount = rt?.bidCount ?? lot.bidCount
      const winnerId = rt?.winnerId !== undefined ? rt.winnerId : (lot.winnerId ?? null)
      const isWinning = rt?.isWinning !== undefined ? rt.isWinning : winnerId === currentUserId
      const isOutbid = rt?.isOutbid ?? (lot.bidderIds.includes(currentUserId) && winnerId !== currentUserId)
      const isWon = rt?.isWon ?? (lot.status === 'sold' && winnerId === currentUserId)
      const isClosed = rt?.isClosed || auctionClosed || ['sold', 'unsold', 'cancelled'].includes(lot.status)
      const suggestedBid = bidCount === 0 ? lot.startingBid : currentBid + lot.bidIncrement

      const realtime: RealtimeLot = {
        ...lot,
        currentBid,
        bidCount,
        bidEndTime: rt?.bidEndTime ?? lot.bidEndTime,
        winnerId,
        isWinning,
        isOutbid,
        isWon,
        isClosed,
        antiSniped: rt?.antiSniped ?? false,
        suggestedBid,
      }

      cache.set(lot.id, { lot, realtime })
      return realtime
    })
  }, [lots, lotUpdates, auctionUpdates, currentUserId])

  function applyOptimisticBid(lotId: number, patch: RealtimeOverride) {
    setLotUpdates(prev => {
      const next = new Map(prev)
      const existing = next.get(lotId) ?? {}
      next.set(lotId, { ...existing, ...patch })
      return next
    })
  }

  return { lots: realtimeLots, applyOptimisticBid }
}

export function useLotRealtime(lots: AuctionLot[]): RealtimeLot[] {
  return useLotRealtimeCore(lots).lots
}

export function useLotRealtimeWithActions(lots: AuctionLot[]) {
  return useLotRealtimeCore(lots)
}
