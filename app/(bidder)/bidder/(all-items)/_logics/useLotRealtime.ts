'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocket } from '@/components/generals/providers/websocket-provider'
import type { AuctionLot } from './auctions'

type RealtimeOverride = {
  currentBid?: number
  bidCount?: number
  bidEndTime?: string
  winnerId?: number | null
  isWinning?: boolean
  isOutbid?: boolean
  isClosed?: boolean
  antiSniped?: boolean
}

type AuctionOverride = { isClosed: boolean }

export type RealtimeLot = AuctionLot & {
  isWinning: boolean
  isOutbid: boolean
  isClosed: boolean
  antiSniped: boolean
  suggestedBid: number
}

export function useLotRealtime(lots: AuctionLot[]): RealtimeLot[] {
  const { subscribe } = useWebSocket()
  const { data: session } = useSession()
  const currentUserId = Number((session?.user as any)?.userId)

  const [lotUpdates, setLotUpdates] = useState<Map<number, RealtimeOverride>>(new Map())
  const [auctionUpdates, setAuctionUpdates] = useState<Map<number, AuctionOverride>>(new Map())

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type !== 'auction_update') return
      const data = msg.data
      if (!data) return

      // Outbid — update card state only (toast/sound handled globally)
      if (data.type === 'outbid' && data.userId === currentUserId) {
        setLotUpdates(prev => {
          const next = new Map(prev)
          const ex = next.get(data.lotId) ?? {}
          next.set(data.lotId, { ...ex, currentBid: data.amount, isOutbid: true, isWinning: false })
          return next
        })
        return
      }

      // Generic bid update — update card state only (toast/sound handled globally)
      if (data.lotId !== undefined && data.currentBid !== undefined) {
        const { lotId, currentBid, bidCount, endTime, bidderId, antiSniped } = data
        const lot = lots.find(l => l.id === lotId)
        const hadBid = lot?.bidderIds?.includes(currentUserId) ?? false
        const nowWinning = bidderId === currentUserId

        setLotUpdates(prev => {
          const next = new Map(prev)
          const ex = next.get(lotId) ?? {}
          const wasWinning = ex.isWinning ?? false
          const nowOutbid = (wasWinning || hadBid) && bidderId !== currentUserId
          next.set(lotId, {
            ...ex,
            currentBid,
            bidCount,
            bidEndTime: endTime,
            winnerId: bidderId,
            isWinning: nowWinning,
            isOutbid: nowOutbid,
            antiSniped: antiSniped ?? false,
          })
          return next
        })
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
    })
  }, [subscribe, currentUserId])

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type !== 'user_event' || msg.event !== 'bidder_outbid') return
      const lotId = msg.data?.lotId
      if (lotId === undefined) return
      setLotUpdates(prev => {
        const next = new Map(prev)
        const existing = next.get(lotId) ?? {}
        next.set(lotId, { ...existing, isOutbid: true, isWinning: false })
        return next
      })
    })
  }, [subscribe])

  const cacheRef = useRef(new Map<number, { lot: AuctionLot; realtime: RealtimeLot }>())

  return useMemo(() => {
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
      const isClosed = auctionClosed || ['sold', 'unsold', 'cancelled'].includes(lot.status)
      const suggestedBid = bidCount === 0 ? lot.startingBid : currentBid + lot.bidIncrement

      const realtime: RealtimeLot = {
        ...lot,
        currentBid,
        bidCount,
        bidEndTime: rt?.bidEndTime ?? lot.bidEndTime,
        winnerId,
        isWinning,
        isOutbid,
        isClosed,
        antiSniped: rt?.antiSniped ?? false,
        suggestedBid,
      }

      cache.set(lot.id, { lot, realtime })
      return realtime
    })
  }, [lots, lotUpdates, auctionUpdates, currentUserId])
}
