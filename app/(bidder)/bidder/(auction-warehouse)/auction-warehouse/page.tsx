'use client'

import { useState } from 'react'
import TopNav from '@/components/generals/top-nav'
import banner from '@/assets/images/all-items.png'
import CategoryBanner from '@/components/generals/category-banner'
import AuctionWarehouse from './_widgets/auction-warehouse'

export default function AuctionWarehousePage() {
    const [page, setPage] = useState(1)

    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <CategoryBanner name="Auction Warehouse" bannerImage={banner} />
            <section className="page-container py-10">
                <AuctionWarehouse page={page} onPageChange={setPage} />
            </section>
        </main>
    )
}
