'use client'

import { Suspense } from 'react'
import TopNav from '@/components/generals/top-nav'
import OrdersAndReturns from './_widgets/orders-and-returns'

export default function BillingPage() {
    return (
        <main className="min-h-screen w-full bg-[#F9FAFB]">
            <TopNav />
            <section className="page-container py-10">
                <div className="mb-8 space-y-1">
                    <h1 className="text-2xl font-bold text-[#2A3239]">Orders & Returns</h1>
                    <p className="text-sm text-[#657688]">Your payment receipts and dispute history.</p>
                </div>
                <Suspense fallback={null}>
                    <OrdersAndReturns />
                </Suspense>
            </section>
        </main>
    )
}
