'use client'

import { useEffect, useMemo, useState } from 'react'
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

// Auction-level overrides (ended/cancelled applies to all lots in that auction)
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

      // Bid placed on a lot
      if (data.lotId !== undefined && data.currentBid !== undefined) {
        const { lotId, currentBid, bidCount, endTime, bidderId, antiSniped } = data
        const lot = lots.find(l => l.id === lotId)
        setLotUpdates(prev => {
          const next = new Map(prev)
          const existing = next.get(lotId) ?? {}
          const wasWinning = existing.isWinning ?? false
          const hadBid = lot?.bidderIds?.includes(currentUserId) ?? false
          next.set(lotId, {
            ...existing,
            currentBid,
            bidCount,
            bidEndTime: endTime,
            winnerId: bidderId,
            isWinning: bidderId === currentUserId,
            isOutbid: (wasWinning || hadBid) && bidderId !== currentUserId,
            antiSniped: antiSniped ?? false,
          })
          return next
        })
      }

      // Auction status changed (no lotId — applies to whole auction)
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

  return useMemo(() => lots.map(lot => {
    const rt = lotUpdates.get(lot.id)
    const auctionClosed = lot.auctionId ? (auctionUpdates.get(lot.auctionId)?.isClosed ?? false) : false
    const currentBid = rt?.currentBid ?? lot.currentBid
    const bidCount = rt?.bidCount ?? lot.bidCount
    const winnerId = rt?.winnerId !== undefined ? rt.winnerId : (lot.winnerId ?? null)
    const isWinning = rt?.isWinning !== undefined ? rt.isWinning : winnerId === currentUserId
    const isOutbid = rt?.isOutbid ?? (lot.bidderIds.includes(currentUserId) && winnerId !== currentUserId)
    const isClosed = auctionClosed || ['sold', 'unsold', 'cancelled'].includes(lot.status)
    const suggestedBid = bidCount === 0 ? lot.startingBid : currentBid + lot.bidIncrement

    return {
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
  }), [lots, lotUpdates, auctionUpdates, currentUserId])
}
