'use client'

import TopNav from '@/components/generals/top-nav'
import ButtonTemplate from '@/components/templates/button-template'
import { AlarmClock, ChevronRight, MoveLeft } from 'lucide-react'
import Image from 'next/image'
import { use, useState, useEffect } from 'react'
import InputTemplate from '@/components/templates/input-template'
import AlertDialogTemplate from '@/components/templates/alert-dialog-template'
import favoriteIcon from '@/assets/svgs/eye.svg'
import { Separator } from '@/components/ui/separator'
import AccordionTemplate from '@/components/templates/accordion-template'
import RelatedProducts from '@/components/generals/related-products'
import { usePublicLot } from '../../_logics/usePublicLot'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { resolveLotMediaUrl, formatLotCondition } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'

function Countdown({ endTime }: { endTime: string }) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    function tick() {
      const diff = new Date(endTime).getTime() - Date.now()
      if (diff <= 0) { setTimeRemaining('ENDED'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${days} DAYS ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div className='text-xs font-medium flex items-center justify-center gap-2 bg-[#E5E5EA] text-black rounded-[48px] px-4 py-2.5'>
      <AlarmClock className='w-4 h-4' />
      <span className="tabular-nums whitespace-nowrap">{timeRemaining}</span>
    </div>
  )
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lot, isLoading, error } = usePublicLot(id)

  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [erroredUrls, setErroredUrls] = useState<Set<string>>(new Set())

  const galleryImages = lot
    ? lot.images
        .filter((img) => img.mediaType === 'image')
        .map((img) => resolveLotMediaUrl(img.url) ?? '')
        .filter(Boolean)
    : []

  if (isLoading) {
    return (
      <section>
        <TopNav />
        <div className='page-container py-10'>
          <div className='h-8 w-64 bg-[#F0F2F5] rounded animate-pulse mb-10' />
          <div className='flex gap-20'>
            <div className='h-[588px] w-[535px] bg-[#F0F2F5] rounded-[16px] animate-pulse shrink-0' />
            <div className='flex flex-col gap-4 flex-1'>
              <div className='h-16 bg-[#F0F2F5] rounded animate-pulse' />
              <div className='h-8 w-48 bg-[#F0F2F5] rounded animate-pulse' />
              <div className='h-8 w-72 bg-[#F0F2F5] rounded animate-pulse' />
              <div className='h-12 bg-[#F0F2F5] rounded animate-pulse mt-4' />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !lot) {
    return (
      <section>
        <TopNav />
        <div className='px-20 py-20 flex justify-center'>
          <p className='text-[#D42620] text-sm'>{error ?? 'Lot not found.'}</p>
        </div>
      </section>
    )
  }

  const conditionFormatted = formatLotCondition(lot.condition)
  const conditionColor =
    lot.condition === 'new' || lot.condition === 'like_new'
      ? 'bg-[#099137]'
      : lot.condition === 'good'
      ? 'bg-[#003C71]'
      : 'bg-[#D42620]'

  const currentImageUrl = galleryImages[selectedImageIndex] ?? ''
  const mainImageBroken = erroredUrls.has(currentImageUrl)

  const deliveryContent = (
    <ul className='list-disc list-inside space-y-1 text-sm'>
      <li>{lot.pickupAvailable ? 'Pickup available' : 'Pickup not available'}</li>
      <li>{lot.shippingAvailable ? 'Shipping available' : 'Shipping not available'}</li>
      {lot.auction.locationName && (
        <li>Location: {lot.auction.locationName}{lot.auction.locationAddress ? `, ${lot.auction.locationAddress}` : ''}</li>
      )}
    </ul>
  )

  return (
    <section>
      <TopNav />
      <div className='page-container py-10'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-[13px]'>
          <ButtonTemplate
            title={<MoveLeft className='w-4 h-4' />}
            className='bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer'
            onClick={() => window.history.back()}
          />
          <span className='text-[#515F6E]'>{lot.category?.name ?? 'All Items'}</span>
          <ChevronRight className='w-4 h-4' />
          <span className='font-semibold line-clamp-1'>{lot.title}</span>
        </div>

        <div className='py-10 flex gap-10'>
          {/* Image gallery */}
          <div className='flex flex-col gap-4 w-[539px] shrink-0'>
            <div className='bg-[#F9FAFB] aspect-square relative overflow-hidden rounded-[16px] w-full border'>
              <div className='absolute inset-0 flex items-center justify-center'>
                {currentImageUrl && !mainImageBroken ? (
                  <Image
                    src={currentImageUrl}
                    alt={lot.title}
                    fill
                    className='object-cover rounded-[16px]'
                    onError={() => setErroredUrls((s) => new Set(s).add(currentImageUrl))}
                  />
                ) : (
                  <div className='w-full h-full bg-[#f1f1f1] flex items-center justify-center'>
                    <span className='text-[#98A2B3] text-sm'>No image</span>
                  </div>
                )}
              </div>
              <div className='absolute bottom-4 right-4 z-10'>
                <Countdown endTime={lot.bidEndTime} />
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className='flex gap-2'>
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-[83px] h-[83px] rounded-[8px] overflow-hidden bg-[#F9FAFB] shrink-0 focus:outline-none ${selectedImageIndex === index ? 'border border-[#0A0A0B] ' : 'bg-[#F9FAFB] border '}`}
                  >
                    {img && !erroredUrls.has(img) ? (
                      <Image
                        src={img}
                        alt={`View ${index + 1}`}
                        fill
                        className='object-cover'
                        onError={() => setErroredUrls((s) => new Set(s).add(img))}
                      />
                    ) : (
                      <div className='w-full h-full bg-[#E4E7EC]' />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className='flex flex-col gap-4 flex-1 min-w-0'>
            <h1 className='text-5xl font-bold'>{lot.title}</h1>
            <div className='flex items-center gap-2'>
              <div className={`w-fit px-2 py-2.5 rounded-[8px] text-white text-xs font-semibold ${conditionColor}`}>
                {conditionFormatted}
              </div>
              <div className='bg-[#E4E7EC] w-fit px-2 py-2.5 rounded-[8px] text-black text-xs font-semibold'>
                1 qty
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <p className='text-sm font-medium'>
                CURRENT BID: <span className='font-semibold text-lg'>GHS {lot.currentBid.toFixed(2)}</span>
              </p>
              <p className='text-sm text-[#657688]'>
                MKT PR: <span className='text-lg font-semibold'>GHS {lot.buyNowPrice.toFixed(2)}</span>
              </p>
            </div>
            <ButtonTemplate
              title={`Bid GHS ${(lot.currentBid + lot.bidIncrement).toFixed(2)}`}
              className='bg-black text-white hover:bg-black w-full h-[48px] mt-4'
            />
            <div className='flex items-center my-2 gap-4'>
              <div className='flex-1 min-w-0'>
                <InputTemplate placeholder='GHS 0.00' className='h-11 shadow-none w-full' inputAlign='center' />
              </div>
              <div className='flex-1 min-w-0'>
                <AlertDialogTemplate
                  trigger={<ButtonTemplate title='Set Max Bid' className='bg-[#FFCC00] text-black hover:bg-[#FFCC00] h-11 w-full' />}
                />
              </div>
            </div>
            <ButtonTemplate
              title={
                <div className='flex items-center gap-2'>
                  <Image
                    src={favoriteIcon}
                    alt='watchlist'
                    className='size-5'
                    style={watchlistIds.has(lot.id) ? { filter: 'brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(1475%) hue-rotate(1deg) brightness(110%)' } : undefined}
                  />
                  <span className='text-sm font-medium'>
                    {pendingIds.has(lot.id)
                      ? watchlistIds.has(lot.id) ? 'Removing...' : 'Adding...'
                      : watchlistIds.has(lot.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </span>
                </div>
              }
              className='bg-white text-black hover:bg-white border w-full h-[48px]'
              disabled={pendingIds.has(lot.id)}
              onClick={() => toggleWatchlist(lot.id)}
            />

            <div>
              <Separator className='h-px' />
              <AccordionTemplate
                className='w-full'
                items={[
                  {
                    value: 'details',
                    trigger: 'Details',
                    content: lot.description || 'No details available.',
                  },
                  {
                    value: 'specification',
                    trigger: 'Specification',
                    content: 'Specifications not available.',
                  },
                  {
                    value: 'delivery-info',
                    trigger: 'Delivery Info',
                    content: deliveryContent,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <RelatedProducts />
      </div>
    </section>
  )
}
