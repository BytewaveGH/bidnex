'use client'

import TopNav from '@/components/generals/top-nav'
import Receipts from './_widgets/receipts'

export default function BillingPage() {
    return (
        <main className="min-h-screen w-full bg-[#F9FAFB]">
            <TopNav />
            <section className="page-container py-10">
                <div className="mb-8 space-y-1">
                    <h1 className="text-2xl font-bold text-[#2A3239]">Billing</h1>
                    <p className="text-sm text-[#657688]">Your payment history and receipts.</p>
                </div>
                <Receipts />
            </section>
        </main>
    )
}
