'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/popular.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import Popular from './_widgets/popular'

function PopularContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams.get('search') ?? undefined

    function handleSearch(query: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (query) params.set('search', query)
        else params.delete('search')
        const qs = params.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
    }

    return (
        <main className="min-h-screen w-full">
            <TopNav onSearch={handleSearch} initialSearchValue={search} />
            <CategoryBanner name="Popular Now" bannerImage={banner} />
            <section className="page-container py-10">
                <FilterBar />
            </section>
            <section className="page-container pb-10">
                <Popular search={search} />
            </section>
        </main>
    )
}

const PopularPage = () => {
    return (
        <Suspense>
            <PopularContent />
        </Suspense>
    )
}

export default PopularPage
