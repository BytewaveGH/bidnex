'use client'

import { useEffect, useMemo, useRef } from 'react'
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
import { useMyBids } from '../../_logics/useMyBids'
import { useLotRealtime } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'

const PAGE_SIZE = 12

type MyBidsProps = {
    page: number
    onPageChange: (page: number) => void
    onTotalPagesChange?: (total: number) => void
}

export default function MyBids({ page, onPageChange, onTotalPagesChange }: MyBidsProps) {
    const { data, lots, isLoading, error } = useMyBids({ page, limit: PAGE_SIZE })
    const baseLots = useMemo(() => lots, [lots])
    const realtimeLots = useLotRealtime(baseLots)

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
                <p className="text-[#657688] text-sm">You haven&apos;t placed any bids yet.</p>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center mb-20">
            <div className="w-full px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                    {realtimeLots.map((lot) => (
                        <div key={lot.id} className="w-full">
                            <LotCardItem lot={lot} />
                        </div>
                    ))}
                </div>
            </div>
            {bottomPagination}
        </div>
    )
}
