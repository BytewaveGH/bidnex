'use client'

import { useRouter } from 'next/navigation'
import { AlarmClock, MapPin, Package } from 'lucide-react'
import { LotImage } from './lot-image'
import { computeTimeRemaining, type Auction } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'

export default function AuctionCard({ auction }: { auction: Auction }) {
  const router = useRouter()
  const thumbnail = auction.lots?.[0]?.primaryImage ?? ''
  const isEnded = auction.status === 'ended' || auction.status === 'cancelled'

  return (
    <div
      className="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      onClick={() => router.push(`/bidder/auction-warehouse/${auction.id}`)}
    >
      <div className="relative w-full h-[180px] bg-[#F0F2F5]">
        <LotImage src={thumbnail} alt={auction.title} className="object-cover" />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-base font-bold line-clamp-1">{auction.title}</h3>
        <p className="text-xs text-[#657688] mt-1 line-clamp-2">{auction.description}</p>

        {auction.locationName && (
          <div className="flex items-center gap-1.5 text-xs text-[#657688] mt-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{auction.locationName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <div className="text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5">
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{auction.lotCount} LOTS</span>
          </div>
          <div className="text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5 min-w-0 overflow-hidden">
            <AlarmClock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate whitespace-nowrap">
              {isEnded ? 'ENDED' : computeTimeRemaining(auction.endTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
