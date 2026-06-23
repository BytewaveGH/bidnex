'use client'

import TopNav from '@/components/generals/top-nav'
import Checkout from '@/app/(bidder)/bidder/(billing)/billing/_widgets/checkout'

export default function WonItemsPage() {
    return (
        <main className="min-h-screen w-full bg-[#F9FAFB]">
            <TopNav />
            <section className="page-container py-10">
                <div className="mb-8 space-y-1">
                    <h1 className="text-2xl font-bold text-[#2A3239]">Won Items</h1>
                    <p className="text-sm text-[#657688]">Review your won items and complete your payment.</p>
                </div>
                <Checkout />
            </section>
        </main>
    )
}
