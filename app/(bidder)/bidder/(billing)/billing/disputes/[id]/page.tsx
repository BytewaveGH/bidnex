'use client'

import { use } from 'react'
import TopNav from '@/components/generals/top-nav'
import DisputeDetail from '../../_widgets/dispute-detail'

type DisputeDetailPageProps = {
  params: Promise<{ id: string }>
}

export default function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { id } = use(params)
  const disputeId = Number(id)

  return (
    <main className="min-h-screen w-full bg-[#F9FAFB]">
      <TopNav />
      <section className="page-container py-8 md:py-10">
        {Number.isFinite(disputeId) ? (
          <DisputeDetail disputeId={disputeId} />
        ) : (
          <p className="text-[#D42620] text-sm">Invalid dispute ID.</p>
        )}
      </section>
    </main>
  )
}
