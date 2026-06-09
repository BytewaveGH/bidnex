'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import AllItems from './_widgets/all-items'

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

    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
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
                    defaultCategory={categoryId ? [String(categoryId)] : []}
                    defaultCondition={condition ? [condition] : []}
                    defaultPrice={getPriceDefaults(minPrice, maxPrice)}
                />
            </section>
            <section className="page-container pb-10">
                <AllItems categoryId={categoryId} condition={condition} minPrice={minPrice} maxPrice={maxPrice} search={search} />
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
