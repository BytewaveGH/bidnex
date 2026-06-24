'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LotCardItem } from '@/components/generals/lot-card-item'
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
import { useLotRealtime } from '../../_logics/useLotRealtime'
import type { LotsOrderBy } from '../../_logics/auctions'

const PAGE_SIZE = 12

type AllItemsProps = {
    condition?: string
    minPrice?: number
    maxPrice?: number
    categoryId?: number
    search?: string
    orderBy?: LotsOrderBy
    page: number
    onPageChange: (page: number) => void
    onTotalPagesChange?: (total: number) => void
}

export default function AllItems({ condition, minPrice, maxPrice, categoryId, search, orderBy, page, onPageChange, onTotalPagesChange }: AllItemsProps) {
    const { data, isLoading, error } = usePublicLots({ page, limit: PAGE_SIZE, condition, minPrice, maxPrice, categoryId, search, orderBy })
    const baseLots = useMemo(() => data?.data ?? [], [data])
    const realtimeLots = useLotRealtime(baseLots)

    const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set())
    // Reset expired set when page/filters change
    useEffect(() => { setExpiredIds(new Set()) }, [page, condition, minPrice, maxPrice, categoryId, search, orderBy])
    const handleExpired = useCallback((id: number) => {
        setExpiredIds(prev => new Set(prev).add(id))
    }, [])
    const visibleLots = useMemo(() => realtimeLots.filter(l => !expiredIds.has(l.id)), [realtimeLots, expiredIds])

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

    if (isLoading && !data) {
        return (
            <div className="w-full px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <div key={i} className="h-[380px] sm:h-[480px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
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

    if (visibleLots.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#657688] text-sm">No items available right now.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center mb-20">
            <div className="w-full px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {visibleLots.map((lot) => (
                        <div key={lot.id} className="w-full">
                            <LotCardItem lot={lot} onExpired={handleExpired} />
                        </div>
                    ))}
                </div>
            </div>
            {bottomPagination}
        </div>
    )
}
