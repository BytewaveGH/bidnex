'use client'

import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import FilterBar from '@/components/generals/filter-bar'
import BuyNow from './_widgets/all-items'
import AllItems from './_widgets/all-items'

const BuyNowPage = () => {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="All ITEMS" bannerImage={banner} />
            <section className="p-20 py-10">
            <FilterBar />
            </section>
            <section className="p-20 py-0">
            <AllItems />
            </section>
        </main>
    )
}

export default BuyNowPage