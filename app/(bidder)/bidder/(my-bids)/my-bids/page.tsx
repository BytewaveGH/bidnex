'use client'

import { useMemo, useState } from 'react'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import MyBids from './_widgets/my-bids'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

export default function MyBidsPage() {
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const pageNumbers = useMemo(() => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (page <= 2) return [1, 2, 3]
        if (page >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages]
        return [page - 1, page, page + 1]
    }, [page, totalPages])

    const topPagination = totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1">
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
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
                            onClick={(e) => { e.preventDefault(); setPage(n) }}
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
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    ) : null

    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="My Bids" bannerImage={banner} />
            <section className="page-container py-10">
                <div className="flex justify-end">{topPagination}</div>
            </section>
            <section className="page-container pb-10">
                <MyBids
                    page={page}
                    onPageChange={setPage}
                    onTotalPagesChange={setTotalPages}
                />
            </section>
        </main>
    )
}
