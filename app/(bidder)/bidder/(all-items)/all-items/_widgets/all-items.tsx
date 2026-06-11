'use client'

import { useEffect, useMemo, useRef } from 'react'
import ProductCard from '@/components/generals/product-card'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { usePublicLots } from '../../_logics/usePublicLots'
import { useWatchlistIds } from '../../_logics/useWatchlistIds'
import { useLotRealtime } from '../../_logics/useLotRealtime'
import { useBidding } from '../../_logics/useBidding'
import { resolveLotMediaUrl, formatLotCondition, computeTimeRemaining, type AuctionLot } from '../../_logics/auctions'
import type { ProductCardType } from '@/lib/interfaces'

const PAGE_SIZE = 12

type AllItemsProps = {
    condition?: string
    minPrice?: number
    maxPrice?: number
    categoryId?: number
    search?: string
    page: number
    onPageChange: (page: number) => void
    onTotalPagesChange?: (total: number) => void
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

export default function AllItems({ condition, minPrice, maxPrice, categoryId, search, page, onPageChange, onTotalPagesChange }: AllItemsProps) {
    const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
    const { data, isLoading, error } = usePublicLots({ page, limit: PAGE_SIZE, condition, minPrice, maxPrice, categoryId, search })
    const baseLots = useMemo(() => data?.data ?? [], [data])
    const realtimeLots = useLotRealtime(baseLots)
    const { placeBid, getState, clearError } = useBidding()

    const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1

    const onTotalPagesChangeRef = useRef(onTotalPagesChange)
    onTotalPagesChangeRef.current = onTotalPagesChange
    useEffect(() => {
        onTotalPagesChangeRef.current?.(totalPages)
    }, [totalPages])

    const pageNumbers = useMemo(() => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (page <= 2) return [1, 2, 3]
        if (page >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages]
        return [page - 1, page, page + 1]
    }, [page, totalPages])

    const bottomPagination = totalPages > 1 ? (
        <div className="flex justify-center mt-10">
            <Pagination className="mx-0 w-auto">
                <PaginationContent className="gap-1">
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, page - 1)) }}
                        />
                    </PaginationItem>
                    {pageNumbers[0] > 1 && (
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                    )}
                    {pageNumbers.map((n) => (
                        <PaginationItem key={n}>
                            <PaginationLink
                                href="#"
                                isActive={n === page}
                                onClick={(e) => { e.preventDefault(); onPageChange(n) }}
                            >
                                {n}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages, page + 1)) }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    ) : null

    if (isLoading) {
        return (
            <div className="w-full px-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
        <div className="w-full flex flex-col items-center mb-20">
            <div className="w-full px-4">
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
            {bottomPagination}
        </div>
    )
}
