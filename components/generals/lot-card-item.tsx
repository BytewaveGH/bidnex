'use client'

import { memo, useCallback, useMemo } from 'react'
import ProductCard from './product-card'
import { mapLotToProductCard } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { useBidding } from '@/app/(bidder)/bidder/(all-items)/_logics/useBidding'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import type { RealtimeLot } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'

type LotCardItemProps = {
  lot: RealtimeLot
  isLoggedIn?: boolean
}

function LotCardItemComponent({ lot, isLoggedIn = true }: LotCardItemProps) {
  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
  const { placeBid, getState, clearError } = useBidding()
  const bidState = getState(lot.id)
  const product = useMemo(() => mapLotToProductCard(lot), [lot])

  const onWatchlistToggle = useCallback(() => {
    void toggleWatchlist(lot.id)
  }, [lot.id, toggleWatchlist])

  const onBid = useCallback(
    (amount: number) => placeBid(lot.id, amount),
    [lot.id, placeBid],
  )

  const onClearBidError = useCallback(() => {
    clearError(lot.id)
  }, [lot.id, clearError])

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
    />
  )
}

export const LotCardItem = memo(
  LotCardItemComponent,
  (prev, next) => prev.lot === next.lot && prev.isLoggedIn === next.isLoggedIn,
)
