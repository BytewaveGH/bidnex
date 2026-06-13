'use client'

import { useMemo } from 'react'
import { LotCardItem } from '@/components/generals/lot-card-item'
import { useWatchlist } from '../../_logics/useWatchlist'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { useLotRealtime } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'

export default function Watchlist() {
    const { data, isLoading, error } = useWatchlist({ page: 1, limit: 20 })
    const { watchlistIds } = useWatchlistIds()

    const lots = useMemo(() => {
        if (!data) return []
        return data.data
            .filter(item => watchlistIds.has(item.lotId))
            .map(item => item.lot)
    }, [data, watchlistIds])

    const realtimeLots = useLotRealtime(lots)

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
                <p className="text-[#657688] text-sm">Your watchlist is empty.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex justify-center items-center mb-20">
            <div className="w-full px-4 flex justify-center items-center">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {realtimeLots.map((lot) => (
                        <div key={lot.id} className="w-full">
                            <LotCardItem lot={lot} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
