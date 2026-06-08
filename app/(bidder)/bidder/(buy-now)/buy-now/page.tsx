'use client'

import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/buy-now.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import BuyNow from './_widgets/buy-now'

const BuyNowPage = () => {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="Buy Now" bannerImage={banner} />
            <section className="p-20 py-10">
            <FilterBar />
            </section>
            <section className="p-20 py-0">
            <BuyNow />
            </section>
        </main>
    )
}

export default BuyNowPage