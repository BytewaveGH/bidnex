'use client'

import { memo, useCallback, useMemo } from 'react'
import ProductCard from './product-card'
import { mapLotToProductCard } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { useBidding } from '@/app/(bidder)/bidder/(all-items)/_logics/useBidding'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { useNavCounts } from './providers/nav-counts-provider'
import type { RealtimeLot } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'

type LotCardItemProps = {
  lot: RealtimeLot
  isLoggedIn?: boolean
  onExpired?: (id: number) => void
}

function LotCardItemComponent({ lot, isLoggedIn = true, onExpired }: LotCardItemProps) {
  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
  const { placeBid, getState, clearError } = useBidding()
  const { incrementMyBidsCount } = useNavCounts()
  const bidState = getState(lot.id)
  const product = useMemo(() => mapLotToProductCard(lot), [lot])

  const onWatchlistToggle = useCallback(() => {
    void toggleWatchlist(lot.id)
  }, [lot.id, toggleWatchlist])

  const onBid = useCallback(
    async (amount: number) => {
      const isFirstBid = !lot.isWinning && !lot.isOutbid
      const success = await placeBid(lot.id, amount)
      if (success && isFirstBid) incrementMyBidsCount()
      return success
    },
    [lot.id, lot.isWinning, lot.isOutbid, placeBid, incrementMyBidsCount],
  )

  const onClearBidError = useCallback(() => {
    clearError(lot.id)
  }, [lot.id, clearError])

  const handleExpired = useCallback(() => {
    onExpired?.(lot.id)
  }, [lot.id, onExpired])

  return (
    <ProductCard
      isLoggedIn={isLoggedIn}
      product={product}
      isInWatchlist={watchlistIds.has(lot.id)}
      onWatchlistToggle={onWatchlistToggle}
      isWatchlistLoading={pendingIds.has(lot.id)}
      isWinning={lot.isWinning}
      isOutbid={lot.isOutbid}
      isClosed={lot.isClosed}
      antiSniped={lot.antiSniped}
      suggestedBid={lot.suggestedBid}
      isBidding={bidState.loading}
      bidError={bidState.error}
      onBid={onBid}
      onClearBidError={onClearBidError}
      onExpired={handleExpired}
    />
  )
}

export const LotCardItem = memo(
  LotCardItemComponent,
  (prev, next) => prev.lot === next.lot && prev.isLoggedIn === next.isLoggedIn && prev.onExpired === next.onExpired,
)
