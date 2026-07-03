'use client'

import { use } from 'react'
import TopNav from '@/components/generals/top-nav'
import AuctionDetail from './_widgets/auction-detail'

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <AuctionDetail id={id} />
        </main>
    )
}
