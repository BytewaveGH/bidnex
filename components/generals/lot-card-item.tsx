'use client'

import { memo, useCallback, useMemo } from 'react'
import ProductCard from './product-card'
import { mapLotToProductCard } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { useBidding } from '@/app/(bidder)/bidder/(all-items)/_logics/useBidding'
import { useMaxBidding } from '@/app/(bidder)/bidder/(all-items)/_logics/useMaxBidding'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { useBuyNow } from '@/app/(bidder)/bidder/(product)/_logics/useBuyNow'
import { useNavCounts } from './providers/nav-counts-provider'
import { showToast } from '@/components/templates/toast-template'
import type { RealtimeLot } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'

type LotCardItemProps = {
  lot: RealtimeLot
  isLoggedIn?: boolean
  onExpired?: (id: number) => void
}

function LotCardItemComponent({ lot, isLoggedIn = true, onExpired }: LotCardItemProps) {
  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
  const { placeBid, getState, clearError } = useBidding()
  const { setMaxBid, getState: getMaxBidState, clearError: clearMaxBidError } = useMaxBidding()
  const { buyNow, isLoading: isBuyingNow } = useBuyNow()
  const { incrementMyBidsCount } = useNavCounts()
  const bidState = getState(lot.id)
  const maxBidState = getMaxBidState(lot.id)
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

  const onSetMaxBid = useCallback(
    async (amount: number) => setMaxBid(lot.id, amount),
    [lot.id, setMaxBid],
  )

  const onClearMaxBidError = useCallback(() => {
    clearMaxBidError(lot.id)
  }, [lot.id, clearMaxBidError])

  const onBuyNow = useCallback(async () => {
    try {
      await buyNow(lot.id)
      incrementMyBidsCount()
      showToast('success', 'Purchase successful! This item is yours.')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete purchase.'
      showToast('failure', message)
      return false
    }
  }, [lot.id, buyNow, incrementMyBidsCount])

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
      isWon={lot.isWon}
      antiSniped={lot.antiSniped}
      suggestedBid={lot.suggestedBid}
      isBidding={bidState.loading}
      bidError={bidState.error}
      onBid={onBid}
      onClearBidError={onClearBidError}
      isSettingMaxBid={maxBidState.loading}
      maxBidError={maxBidState.error}
      onSetMaxBid={onSetMaxBid}
      onClearMaxBidError={onClearMaxBidError}
      isBuyingNow={isBuyingNow}
      onBuyNow={onBuyNow}
      onExpired={handleExpired}
    />
  )
}

export const LotCardItem = memo(
  LotCardItemComponent,
  (prev, next) => prev.lot === next.lot && prev.isLoggedIn === next.isLoggedIn && prev.onExpired === next.onExpired,
)
