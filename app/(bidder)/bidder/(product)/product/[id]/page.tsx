'use client'

import TopNav from '@/components/generals/top-nav'
import ButtonTemplate from '@/components/templates/button-template'
import { AlarmClock, ChevronRight, Loader2, MoveLeft, UsersRound } from 'lucide-react'
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
import { useWebSocket } from '@/components/generals/providers/websocket-provider'
import { useAxios } from '@/hooks/use-axios'
import { useSession } from 'next-auth/react'
import { resolveLotMediaUrl, formatLotCondition } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { LotImage } from '@/components/generals/lot-image'

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
  const { send, subscribe, isConnected } = useWebSocket()
  const callApi = useAxios()
  const { data: session } = useSession()
  const currentUserId = Number((session?.user as any)?.userId)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isBidding, setIsBidding] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  // Real-time overrides from WebSocket — merged with REST data below
  const [rt, setRt] = useState<{
    currentBid?: number
    bidCount?: number
    bidEndTime?: string
    isWinning?: boolean
    isOutbid?: boolean
  }>({})

  // Join auction room once lot is loaded and WS is connected
  useEffect(() => {
    if (!lot || !isConnected) return
    const auctionId = String(lot.auction.id)
    send({ type: 'join_auction', auctionId })
    return () => { send({ type: 'leave_auction', auctionId }) }
  }, [lot?.id, isConnected])

  // Subscribe to real-time bid events
  useEffect(() => {
    return subscribe((msg) => {
      if (!lot) return

      if (msg.type === 'auction_update' && msg.data?.lotId === lot.id) {
        const { currentBid, bidCount, endTime, bidderId } = msg.data
        setRt(prev => {
          const hadBid = prev.isWinning || prev.isOutbid || lot.bidderIds.includes(currentUserId)
          return {
            ...prev,
            currentBid,
            bidCount,
            bidEndTime: endTime,
            isWinning: bidderId === currentUserId,
            isOutbid: hadBid && bidderId !== currentUserId,
          }
        })
      }

      if (msg.type === 'user_event' && msg.event === 'bidder_outbid' && msg.data?.lotId === lot.id) {
        setRt(prev => ({ ...prev, isOutbid: true, isWinning: false }))
      }
    })
  }, [subscribe, lot?.id, currentUserId])

  const galleryImages = lot
    ? lot.images
      .filter((img) => img.mediaType === 'image')
      .map((img) => resolveLotMediaUrl(img.url) ?? '')
      .filter(Boolean)
    : []

  async function handleBid(amount: number) {
    if (!lot) return
    setIsBidding(true)
    setBidError(null)
    try {
      const res = await callApi({ method: 'POST', url: `/bidder/lots/${lot.id}/bids`, data: { amount } }) as any
      if (res.status === 201 || res.status === 200) {
        setRt(prev => ({
          ...prev,
          isWinning: true,
          isOutbid: false,
          currentBid: amount,
          bidCount: (prev.bidCount ?? lot.bidCount) + 1,
        }))
      } else {
        setBidError(res.data?.error ?? res.data?.message ?? 'Failed to place bid.')
      }
    } catch {
      setBidError('Network error. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <TopNav />
        <div className='page-container py-10'>
          <div className='h-8 w-64 bg-[#F0F2F5] rounded animate-pulse mb-10' />
          <div className='flex gap-10'>
            <div className='w-1/2 shrink-0 flex flex-col gap-4 items-center'>
              <div className='w-[539px] h-[539px] bg-[#F0F2F5] rounded-[16px] animate-pulse' />
              <div className='w-[539px] flex gap-2'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='w-[83px] h-[83px] bg-[#F0F2F5] rounded-[8px] animate-pulse shrink-0' />
                ))}
              </div>
            </div>
            <div className='w-1/2 flex flex-col gap-4'>
              <div className='h-16 bg-[#F0F2F5] rounded animate-pulse' />
              <div className='flex gap-2'>
                <div className='h-9 w-24 bg-[#F0F2F5] rounded-[8px] animate-pulse' />
                <div className='h-9 w-16 bg-[#F0F2F5] rounded-[8px] animate-pulse' />
              </div>
              <div className='h-6 w-72 bg-[#F0F2F5] rounded animate-pulse' />
              <div className='h-[48px] bg-[#F0F2F5] rounded animate-pulse mt-4' />
              <div className='flex gap-4'>
                <div className='h-11 flex-1 bg-[#F0F2F5] rounded animate-pulse' />
                <div className='h-11 flex-1 bg-[#F0F2F5] rounded animate-pulse' />
              </div>
              <div className='h-[48px] bg-[#F0F2F5] rounded animate-pulse' />
              <div className='h-px bg-[#F0F2F5] mt-2' />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-12 bg-[#F0F2F5] rounded animate-pulse' />
              ))}
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
    lot.condition === 'new' || lot.condition === 'like_new' ? 'bg-[#099137]'
      : lot.condition === 'good' ? 'bg-[#003C71]'
        : 'bg-[#D42620]'

  const currentImageUrl = galleryImages[selectedImageIndex] ?? ''

  // Merge REST data with real-time overrides
  const currentBid = rt.currentBid ?? lot.currentBid
  const bidCount = rt.bidCount ?? lot.bidCount
  const bidEndTime = rt.bidEndTime ?? lot.bidEndTime
  const isWon = lot.status === 'sold' && lot.winnerId === currentUserId
  const isWinning = !isWon && (rt.isWinning ?? (lot.winnerId === currentUserId))
  const isOutbid = !isWon && (rt.isOutbid ?? (lot.bidderIds.includes(currentUserId) && lot.winnerId !== currentUserId))
  const isClosed = !isWon && (lot.status === 'ended' || lot.status === 'cancelled' || lot.auction.status === 'ended' || lot.auction.status === 'cancelled')
  const suggestedBid = bidCount === 0 ? lot.startingBid : currentBid + lot.bidIncrement

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
          <div className='flex flex-col gap-4 w-1/2 shrink-0 items-center'>
            <div className={`bg-[#F9FAFB] w-[539px] h-[539px] relative overflow-hidden rounded-[16px] border ${isClosed ? 'opacity-60' : ''}`}>
              <div className='absolute inset-0 flex items-center justify-center'>
                <LotImage
                  src={currentImageUrl}
                  alt={lot.title}
                  className='object-cover rounded-[16px]'
                  sizes='539px'
                />
              </div>

              {isWinning && (
                <div className='absolute -top-2 -left-8 overflow-hidden w-40 h-40 z-10 pointer-events-none'>
                  <div className='absolute bg-[#099137] text-white text-sm font-bold py-2 w-56 text-center -rotate-45 top-10 -left-8 tracking-wide whitespace-nowrap'>
                    WINNING • WINNING • WINNING •
                  </div>
                </div>
              )}

              {isOutbid && (
                <div className='absolute  -top-2 -left-8 overflow-hidden w-40 h-40 z-10 pointer-events-none'>
                  <div className='absolute bg-[#F3A218] text-white text-sm font-bold py-2 w-56 text-center -rotate-45 top-10 -left-8 tracking-wide whitespace-nowrap'>
                    OUTBID • OUTBID • OUTBID •
                  </div>
                </div>
              )}

              {isClosed && (
                <div className='absolute  -top-2 -left-8 overflow-hidden w-40 h-40 z-10 pointer-events-none'>
                  <div className='absolute bg-[#D96B6B] text-white text-sm font-bold py-2 w-56 text-center -rotate-45 top-10 -left-8 tracking-wide whitespace-nowrap'>
                    SOLD • SOLD • SOLD • SOLD •
                  </div>
                </div>
              )}

              {isWon && (
                <div className='absolute -top-2 -left-8 overflow-hidden w-40 h-40 z-10 pointer-events-none'>
                  <div className='absolute bg-[#099137] text-white text-sm font-bold py-2 w-56 text-center -rotate-45 top-10 -left-8 tracking-wide whitespace-nowrap'>
                    WON • WON • WON • WON •
                  </div>
                </div>
              )}

              <div className='absolute bottom-4 right-4 z-10'>
                <Countdown endTime={bidEndTime} />
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className='flex gap-2 w-[539px]'>
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-[83px] h-[83px] rounded-[8px] overflow-hidden bg-[#F9FAFB] shrink-0 focus:outline-none ${selectedImageIndex === index ? 'border border-[#0A0A0B]' : 'bg-[#F9FAFB] border'}`}
                  >
                    {img ? (
                      <LotImage
                        src={img}
                        alt={`View ${index + 1}`}
                        className='object-cover'
                        sizes='83px'
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
          <div className='flex flex-col gap-4 w-1/2 min-w-0'>
            <h1 className='text-3xl font-bold'>{lot.title}</h1>

            <div className='flex items-center gap-2'>
              <div className={`w-fit px-2 py-2.5 rounded-[8px] text-white text-xs font-semibold ${conditionColor}`}>
                {conditionFormatted}
              </div>
              <div className='bg-[#E4E7EC] w-fit px-2 py-2.5 rounded-[8px] text-black text-xs font-semibold'>
                1 qty
              </div>
              {/* {isWinning && (
                <div className='bg-[#099137] text-white text-xs font-bold px-3 py-2 rounded-[8px]'>
                  YOU&apos;RE WINNING
                </div>
              )} */}
            </div>

            {/* {isOutbid && (
              <div className='rounded-[8px] bg-[#FFF3CD] border border-[#FFCC00] px-3 py-2 text-sm font-medium text-[#7A5F00]'>
                You were outbid — place a new bid to get back in the lead.
              </div>
            )} */}

            <div className='flex items-center gap-4 flex-wrap'>
              <p className='text-sm font-medium'>
                CURRENT BID: <span className='font-semibold text-lg'>GHS {currentBid.toFixed(2)}</span>
              </p>
              <p className='text-sm text-[#657688]'>
                MKT PR: <span className='text-lg font-semibold'>GHS {lot.buyNowPrice.toFixed(2)}</span>
              </p>
              <div className='text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5'>
                <UsersRound className='w-3.5 h-3.5 shrink-0' />
                <span>{bidCount} BIDDERS</span>
              </div>
            </div>

            {!isWon && (
              <>
                <ButtonTemplate
                  title={
                    isBidding
                      ? <Loader2 className='w-4 h-4 animate-spin' />
                      : `Bid GHS ${suggestedBid.toFixed(2)}`
                  }
                  className={`w-full h-[48px] mt-4 ${isWinning ? 'bg-[#099137] hover:bg-[#099137]' : 'bg-black hover:bg-black'} text-white`}
                  disabled={isBidding}
                  onClick={() => handleBid(suggestedBid)}
                />

                {bidError && (
                  <p className='text-[#D42620] text-sm -mt-2 cursor-pointer' onClick={() => setBidError(null)}>
                    {bidError}
                  </p>
                )}

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
              </>
            )}

            <div>
              <Separator className='h-px' />
              <AccordionTemplate
                className='w-full'
                items={[
                  { value: 'details', trigger: 'Details', content: lot.description || 'No details available.' },
                  {
                    value: 'specification',
                    trigger: 'Specification',
                    content: lot.specifications && Object.keys(lot.specifications).length > 0
                      ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          {Object.entries(lot.specifications).map(([key, value]) => (
                            <div key={key} className="contents">
                              <span className="font-medium capitalize">{key}</span>
                              <span className="text-muted-foreground">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )
                      : 'Specifications not available.',
                  },
                  { value: 'delivery-info', trigger: 'Delivery Info', content: deliveryContent },
                ]}
              />
            </div>
          </div>
        </div>

        <RelatedProducts categoryId={lot.category?.id} excludeLotId={lot.id} />
      </div>
    </section>
  )
}
