'use client'

import { useMemo } from 'react'
import ProductCard from '@/components/generals/product-card'
import { useWonItems } from '../../_logics/useWonItems'
import { mapLotToProductCard } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'

export default function WonItems() {
    const { data, isLoading, error } = useWonItems({ page: 1, limit: 20 })

    const items = useMemo(() => {
        if (!data) return []
        return data.data.map(mapLotToProductCard)
    }, [data])

    if (isLoading) {
        return (
            <div className="w-full px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
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
                <p className="text-[#657688] text-sm">You haven&apos;t won any items yet.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex justify-center items-center mb-20">
            <div className="w-full px-4 flex justify-center items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {items.map((item) => (
                        <div key={item.id} className="w-full">
                            <ProductCard product={item} isWon />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
