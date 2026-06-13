'use client'

import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import WonItems from './_widgets/won-items'

export default function WonItemsPage() {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="Won Items" bannerImage={banner} />
            <section className="page-container pb-10 pt-10">
                <WonItems />
            </section>
        </main>
    )
}
