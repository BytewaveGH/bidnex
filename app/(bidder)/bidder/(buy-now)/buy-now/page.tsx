'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/buy-now.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import BuyNow from './_widgets/buy-now'

function BuyNowContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams.get('search') ?? undefined

    const [page, setPage] = useState(1)

    function handleSearch(query: string) {
        setPage(1)
        const params = new URLSearchParams(searchParams.toString())
        if (query) params.set('search', query)
        else params.delete('search')
        const qs = params.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
    }

    return (
        <main className="min-h-screen w-full">
            <TopNav onSearch={handleSearch} initialSearchValue={search} />
            <CategoryBanner name="Buy Now" bannerImage={banner} />
            <section className="page-container py-10">
                <FilterBar />
            </section>
            <section className="page-container pb-10">
                <BuyNow page={page} onPageChange={setPage} search={search} />
            </section>
        </main>
    )
}

const BuyNowPage = () => {
    return (
        <Suspense>
            <BuyNowContent />
        </Suspense>
    )
}

export default BuyNowPage
