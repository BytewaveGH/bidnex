'use client'

import { useMemo } from 'react'
import ProductCard from '@/components/generals/product-card'
import { usePublicLots } from '../../_logics/usePublicLots'
import { useWatchlistIds } from '../../_logics/useWatchlistIds'
import { useLotRealtime } from '../../_logics/useLotRealtime'
import { useBidding } from '../../_logics/useBidding'
import { resolveLotMediaUrl, formatLotCondition, computeTimeRemaining, type AuctionLot } from '../../_logics/auctions'
import type { ProductCardType } from '@/lib/interfaces'

type AllItemsProps = {
    condition?: string
    minPrice?: number
    maxPrice?: number
    categoryId?: number
    search?: string
}

function mapLotToProductCard(lot: AuctionLot): ProductCardType {
    return {
        id: lot.id,
        image: resolveLotMediaUrl(lot.primaryImage) ?? '',
        condition: formatLotCondition(lot.condition),
        quantity: 1,
        timeRemaining: computeTimeRemaining(lot.bidEndTime),
        bidEndTime: lot.bidEndTime,
        bidders: lot.bidCount,
        productName: lot.title,
        marketPrice: `GHS ${lot.buyNowPrice.toFixed(2)}`,
        currentBid: lot.currentBid,
        increment: lot.bidIncrement,
    }
}

export default function AllItems({ condition, minPrice, maxPrice, categoryId, search }: AllItemsProps) {
    const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
    const { data, isLoading, error } = usePublicLots({ page: 1, limit: 20, condition, minPrice, maxPrice, categoryId, search })
    const baseLots = useMemo(() => data?.data ?? [], [data])
    const realtimeLots = useLotRealtime(baseLots)
    const { placeBid, getState, clearError } = useBidding()

    if (isLoading) {
        return (
            <div className="w-full px-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[480px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#D42620] text-sm">{error}</p>
            </div>
        )
    }

    if (realtimeLots.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#657688] text-sm">No items available right now.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex justify-center items-center mb-20">
            <div className="w-full px-4 flex justify-center items-center">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {realtimeLots.map((lot) => {
                        const bidState = getState(lot.id)
                        return (
                            <div key={lot.id} className="w-full">
                                <ProductCard
                                    isLoggedIn={true}
                                    product={mapLotToProductCard(lot)}
                                    isInWatchlist={watchlistIds.has(lot.id)}
                                    onWatchlistToggle={() => toggleWatchlist(lot.id)}
                                    isWatchlistLoading={pendingIds.has(lot.id)}
                                    isWinning={lot.isWinning}
                                    isOutbid={lot.isOutbid}
                                    isClosed={lot.isClosed}
                                    antiSniped={lot.antiSniped}
                                    suggestedBid={lot.suggestedBid}
                                    isBidding={bidState.loading}
                                    bidError={bidState.error}
                                    onBid={(amount) => placeBid(lot.id, amount)}
                                    onClearBidError={() => clearError(lot.id)}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
