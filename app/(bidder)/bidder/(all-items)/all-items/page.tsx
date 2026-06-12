'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import AllItems from './_widgets/all-items'
import type { LotsOrderBy } from '../_logics/auctions'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

function parseNumber(val: string | null): number | undefined {
    if (!val) return undefined
    const n = parseFloat(val)
    return isNaN(n) ? undefined : n
}

const PRICE_OPTIONS = [
    { value: 'under-50', min: undefined as number | undefined, max: 50 },
    { value: '50-100', min: 50, max: 100 },
    { value: '100-300', min: 100, max: 300 },
    { value: '300-500', min: 300, max: 500 },
    { value: '500-1000', min: 500, max: 1000 },
    { value: '1000-10000', min: 1000, max: 10000 },
]

function getPriceDefaults(min: number | undefined, max: number | undefined): string[] {
    if (min === undefined && max === undefined) return []
    return PRICE_OPTIONS
        .filter((opt) => opt.min === min && opt.max === max)
        .map((opt) => opt.value)
}

function AllItemsContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const categoryId = parseNumber(searchParams.get('categoryId'))
    const condition = searchParams.get('condition') ?? undefined
    const minPrice = parseNumber(searchParams.get('minPrice'))
    const maxPrice = parseNumber(searchParams.get('maxPrice'))
    const search = searchParams.get('search') ?? undefined
    const orderByParam = searchParams.get('orderBy')
    const orderBy: LotsOrderBy | undefined =
        orderByParam === 'ending_soon' || orderByParam === 'ending_last' ? orderByParam : undefined

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            setPage(1)
            const params = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(updates)) {
                if (value === undefined || value === '') {
                    params.delete(key)
                } else {
                    params.set(key, value)
                }
            }
            const qs = params.toString()
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
        },
        [router, pathname, searchParams]
    )

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
            <TopNav
                onSearch={(q) => updateParams({ search: q || undefined })}
                initialSearchValue={search}
            />
            <CategoryBanner name="All ITEMS" bannerImage={banner} />
            <section className="page-container py-10">
                <FilterBar
                    onCategoryChange={(id) => updateParams({ categoryId: id?.toString() })}
                    onConditionChange={(c) => updateParams({ condition: c })}
                    onPriceChange={(min, max) =>
                        updateParams({
                            minPrice: min?.toString(),
                            maxPrice: max?.toString(),
                        })
                    }
                    onOrderByChange={(nextOrderBy) => updateParams({ orderBy: nextOrderBy })}
                    defaultCategory={categoryId ? [String(categoryId)] : []}
                    defaultCondition={condition ? [condition] : []}
                    defaultPrice={getPriceDefaults(minPrice, maxPrice)}
                    defaultOrderBy={orderBy}
                    rightSlot={topPagination}
                />
            </section>
            <section className="page-container pb-10">
                <AllItems
                    categoryId={categoryId}
                    condition={condition}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    search={search}
                    orderBy={orderBy}
                    page={page}
                    onPageChange={setPage}
                    onTotalPagesChange={setTotalPages}
                />
            </section>
        </main>
    )
}

export default function BuyNowPage() {
    return (
        <Suspense>
            <AllItemsContent />
        </Suspense>
    )
}
