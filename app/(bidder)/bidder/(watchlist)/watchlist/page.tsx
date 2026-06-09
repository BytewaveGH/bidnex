'use client'

import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import Watchlist from './_widgets/watchlist'

export default function WatchlistPage() {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="My Watchlist" bannerImage={banner} />
            <section className="page-container pb-10 pt-10">
                <Watchlist />
            </section>
        </main>
    )
}
