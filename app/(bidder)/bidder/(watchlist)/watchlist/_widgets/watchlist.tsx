'use client'

import { useMemo } from 'react'
import ProductCard from '@/components/generals/product-card'
import { useWatchlist } from '../../_logics/useWatchlist'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { resolveLotMediaUrl, formatLotCondition, computeTimeRemaining } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import type { ProductCardType } from '@/lib/interfaces'
import type { WatchlistItem } from '../../_logics/useWatchlist'

function mapWatchlistItemToProductCard(item: WatchlistItem): ProductCardType {
    const lot = item.lot
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

export default function Watchlist() {
    const { data, isLoading, error } = useWatchlist({ page: 1, limit: 20 })
    const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()

    const items = useMemo(() => {
        if (!data) return []
        return data.data.map(mapWatchlistItemToProductCard)
    }, [data])

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

    if (items.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#657688] text-sm">Your watchlist is empty.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex justify-center items-center mb-20">
            <div className="w-full px-4 flex justify-center items-center">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {items.map((item) => (
                        <div key={item.id} className="w-full">
                            <ProductCard isLoggedIn={true} product={item} isInWatchlist={watchlistIds.has(item.id)} onWatchlistToggle={() => toggleWatchlist(item.id)} isWatchlistLoading={pendingIds.has(item.id)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
