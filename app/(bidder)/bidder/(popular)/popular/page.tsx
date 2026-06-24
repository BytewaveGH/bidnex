'use client'

import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/popular.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import Popular from './_widgets/popular'

const BuyNowPage = () => {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="Popular Now" bannerImage={banner} />
            <section className="page-container py-10">
                <FilterBar />
            </section>
            <section className="page-container pb-10">
                <Popular />
            </section>
        </main>
    )
}

export default BuyNowPage