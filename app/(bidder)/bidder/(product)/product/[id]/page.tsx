'use client'

import TopNav from '@/components/generals/top-nav'
import ButtonTemplate from '@/components/templates/button-template'
import { AlarmClock, ChevronRight, Loader2, MoveLeft, PlayCircle, UsersRound } from 'lucide-react'
import Image from 'next/image'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InputTemplate from '@/components/templates/input-template'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { showToast } from '@/components/templates/toast-template'
import favoriteIcon from '@/assets/svgs/eye.svg'
import { Separator } from '@/components/ui/separator'
import AccordionTemplate from '@/components/templates/accordion-template'
import RelatedProducts from '@/components/generals/related-products'
import { usePublicLot } from '../../_logics/usePublicLot'
import { useMaxBid } from '../../_logics/useMaxBid'
import { useBuyNow } from '../../_logics/useBuyNow'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { useResyncOnReconnect } from '@/components/generals/providers/websocket-provider'
import { useNavCounts } from '@/components/generals/providers/nav-counts-provider'
import { useAxios } from '@/hooks/use-axios'
import { useSession } from 'next-auth/react'
import { resolveLotMediaUrl, formatLotCondition } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { useLotRealtimeWithActions } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'
import { LotImage } from '@/components/generals/lot-image'

function Countdown({ endTime }: { endTime: string }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    function tick() {
      const diff = new Date(endTime).getTime() - Date.now()
      if (diff <= 0) { setLabel('ENDED'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setLabel(`${days} DAYS ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return <span className="tabular-nums whitespace-nowrap">{label}</span>
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: lot, isLoading, error, refetch } = usePublicLot(id)
  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds()
  const { incrementMyBidsCount } = useNavCounts()
  const callApi = useAxios()
  const { data: session } = useSession()
  const currentUserId = Number((session?.user as any)?.userId)
  const isLoggedIn = session?.user?.userType === 'bidder'

  const { setMaxBid, isLoading: isSettingMaxBid } = useMaxBid()
  const { buyNow, isLoading: isBuyingNow } = useBuyNow()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isBidding, setIsBidding] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [maxBidInput, setMaxBidInput] = useState('')
  const [confirmMaxBidOpen, setConfirmMaxBidOpen] = useState(false)
  const [confirmBuyNowOpen, setConfirmBuyNowOpen] = useState(false)

  // Real-time overrides from WebSocket — same hook every grid/list view uses, so
  // this page gets room-joining, resync-on-reconnect, and outbid/winning handling
  // for free instead of a hand-duplicated copy of that logic.
  const { lots: [realtime], applyOptimisticBid } = useLotRealtimeWithActions(lot ? [lot] : [])

  useResyncOnReconnect(refetch)

  // Must be declared before early returns to obey Rules of Hooks
  const [isTimeEnded, setIsTimeEnded] = useState(false)
  const bidEndTimeForTimer = realtime?.bidEndTime ?? lot?.bidEndTime ?? ''
  useEffect(() => {
    if (!bidEndTimeForTimer) return
    setIsTimeEnded(false)
    const diff = new Date(bidEndTimeForTimer).getTime() - Date.now()
    if (diff <= 0) { setIsTimeEnded(true); return }
    const t = setTimeout(() => setIsTimeEnded(true), diff)
    return () => clearTimeout(t)
  }, [bidEndTimeForTimer])

  const galleryMedia = lot
    ? lot.images
      .map((img) => ({ url: resolveLotMediaUrl(img.url) ?? '', mediaType: img.mediaType }))
      .filter((media) => media.url)
    : []

  async function handleBid(amount: number) {
    if (!lot) return
    setIsBidding(true)
    setBidError(null)
    try {
      const res = await callApi({ method: 'POST', url: `/bidder/lots/${lot.id}/bids`, data: { amount } }) as any
      if (res.status === 201 || res.status === 200) {
        const isFirstBid = !realtime?.isWinning && !realtime?.isOutbid && !lot.bidderIds.includes(currentUserId)
        applyOptimisticBid(lot.id, {
          isWinning: true,
          isOutbid: false,
          currentBid: amount,
          bidCount: (realtime?.bidCount ?? lot.bidCount) + 1,
        })
        if (isFirstBid) incrementMyBidsCount()
      } else {
        setBidError(res.data?.error ?? res.data?.message ?? 'Failed to place bid.')
      }
    } catch {
      setBidError('Network error. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  async function handleConfirmMaxBid() {
    if (!lot) return
    const amount = Number(maxBidInput)
    setConfirmMaxBidOpen(false)
    try {
      await setMaxBid(lot.id, amount)
      showToast('success', `Max bid of GHS ${amount.toFixed(2)} set.`)
      setMaxBidInput('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set max bid.'
      showToast('failure', message)
    }
  }

  async function handleConfirmBuyNow() {
    if (!lot) return
    setConfirmBuyNowOpen(false)
    try {
      await buyNow(lot.id)
      applyOptimisticBid(lot.id, { isClosed: true, isWon: true, isWinning: true })
      incrementMyBidsCount()
      showToast('success', 'Purchase successful! This item is yours.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete purchase.'
      showToast('failure', message)
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
      : lot.condition === 'good_condition' ? 'bg-[#003C71]'
        : 'bg-[#D42620]'

  const currentMedia = galleryMedia[selectedImageIndex] ?? { url: '', mediaType: 'image' as const }

  // Merge REST data with real-time overrides
  const currentBid = realtime?.currentBid ?? lot.currentBid
  const bidCount = realtime?.bidCount ?? lot.bidCount
  const bidEndTime = realtime?.bidEndTime ?? lot.bidEndTime
  const isWon = realtime?.isWon ?? (lot.status === 'sold' && lot.winnerId === currentUserId)
  const isWinning = !isWon && (realtime?.isWinning ?? (lot.winnerId === currentUserId))
  const isOutbid = !isWon && (realtime?.isOutbid ?? (lot.bidderIds.includes(currentUserId) && lot.winnerId !== currentUserId))
  const isClosed = !isWon && (realtime?.isClosed || lot.status === 'ended' || lot.status === 'cancelled' || lot.auction.status === 'ended' || lot.auction.status === 'cancelled')
  const suggestedBid = bidCount === 0 ? lot.startingBid : currentBid + lot.bidIncrement
  const parsedMaxBid = Number(maxBidInput)
  const isMaxBidValid = maxBidInput.trim() !== '' && Number.isFinite(parsedMaxBid) && parsedMaxBid > 0

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
      <div className='page-container py-6 md:py-10'>
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

        <div className='py-6 md:py-10 flex flex-col md:flex-row gap-6 md:gap-10'>
          {/* Image gallery */}
          <div className='flex flex-col gap-4 w-full md:w-1/2 md:shrink-0 items-center'>
            <div className={`bg-[#F9FAFB] w-full max-w-[539px] aspect-square relative overflow-hidden rounded-[16px] border ${isClosed ? 'opacity-60' : ''}`}>
              <div className='absolute inset-0 flex items-center justify-center'>
                {currentMedia.mediaType === 'video' ? (
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    playsInline
                    className='w-full h-full object-cover rounded-[16px]'
                  />
                ) : (
                  <LotImage
                    src={currentMedia.url}
                    alt={lot.title}
                    className='object-cover rounded-[16px]'
                    sizes='(max-width: 768px) 100vw, 539px'
                  />
                )}
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
                <div className='text-xs font-medium flex items-center justify-center gap-2 bg-[#E5E5EA] text-black rounded-[48px] px-4 py-2.5'>
                  <AlarmClock className='w-4 h-4' />
                  <Countdown endTime={bidEndTime} />
                </div>
              </div>

            </div>

            {galleryMedia.length > 1 && (
              <div className='flex gap-2 w-full max-w-[539px] overflow-x-auto'>
                {galleryMedia.map((media, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-[83px] h-[83px] rounded-[8px] overflow-hidden bg-[#F9FAFB] shrink-0 focus:outline-none ${selectedImageIndex === index ? 'border border-[#0A0A0B]' : 'bg-[#F9FAFB] border'}`}
                  >
                    {media.url ? (
                      media.mediaType === 'video' ? (
                        <>
                          <video src={media.url} muted playsInline preload='metadata' className='w-full h-full object-cover' />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                            <PlayCircle className='w-6 h-6 text-white' />
                          </div>
                        </>
                      ) : (
                        <LotImage
                          src={media.url}
                          alt={`View ${index + 1}`}
                          className='object-cover'
                          sizes='83px'
                        />
                      )
                    ) : (
                      <div className='w-full h-full bg-[#E4E7EC]' />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className='flex flex-col gap-4 w-full md:w-1/2 min-w-0'>
            <h1 className='text-2xl md:text-3xl font-bold'>{lot.title}</h1>

            <div className='flex items-center gap-2 flex-wrap'>
              <div className={`w-fit px-2 py-2.5 rounded-[8px] text-white text-xs font-semibold ${conditionColor}`}>
                {conditionFormatted}
              </div>
              <div className='bg-[#E4E7EC] w-fit px-2 py-2.5 rounded-[8px] text-black text-xs font-semibold'>
                1 qty
              </div>
              <div className='text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5'>
                <UsersRound className='w-3.5 h-3.5 shrink-0' />
                <span>{bidCount} BIDS</span>
              </div>
            </div>

<div className='flex items-center gap-4 flex-wrap'>
              <p className='text-sm font-medium'>
                CURRENT BID: <span className='font-semibold text-lg'>GHS {currentBid.toFixed(2)}</span>
              </p>
              <p className='text-sm text-[#657688]'>
                MKT PR: <span className='text-lg font-semibold'>GHS {(lot.msrp ?? 0).toFixed(2)}</span>
              </p>
            </div>

            {!isWon && !isLoggedIn && (
              <ButtonTemplate
                title='Login to Bid'
                className='bg-black text-white hover:bg-black w-full h-[48px] mt-4'
                onClick={() => router.push('/auth/login')}
              />
            )}

            {!isWon && isLoggedIn && (
              <>
                <div className='relative h-[48px] mt-4 rounded-[6px] overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => handleBid(suggestedBid)}
                    disabled={isBidding || isWinning || isClosed || isTimeEnded}
                    className='absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
                    style={{
                      width: lot.buyNowPrice ? '70%' : '100%',
                      backgroundColor: isWinning ? '#099137' : '#000',
                      clipPath: lot.buyNowPrice ? 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' : undefined,
                    }}
                  >
                    {isBidding
                      ? <Loader2 className='w-4 h-4 animate-spin' />
                      : `Bid GHS ${suggestedBid.toFixed(2)}`}
                  </button>

                  {!!lot.buyNowPrice && (
                    <button
                      type='button'
                      onClick={() => setConfirmBuyNowOpen(true)}
                      disabled={isBuyingNow || isClosed || isTimeEnded}
                      className='absolute inset-y-0 right-0 flex flex-col md:flex-row md:gap-1 items-center justify-center bg-[#003C71] text-white text-[11px] md:text-sm leading-tight font-semibold hover:brightness-110 transition-[filter] px-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
                      style={{ width: 'calc(30% + 18px)', clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)' }}
                    >
                      {isBuyingNow ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <>
                          <span>Buy Now</span>
                          <span>GHS {lot.buyNowPrice.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {bidError && (
                  <p className='text-[#D42620] text-sm -mt-2 cursor-pointer' onClick={() => setBidError(null)}>
                    {bidError}
                  </p>
                )}

                <div className='flex items-center my-2 gap-4'>
                  <div className='flex-1 min-w-0'>
                    <InputTemplate
                      placeholder='GHS 0.00'
                      className='h-11 shadow-none w-full'
                      inputAlign='center'
                      type='number'
                      value={maxBidInput}
                      onChange={(e) => setMaxBidInput(e.target.value)}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <ButtonTemplate
                      title={isSettingMaxBid ? <Loader2 className='w-4 h-4 animate-spin mx-auto' /> : 'Set Max Bid'}
                      className='bg-[#FFCC00] text-black hover:bg-[#FFCC00] h-11 w-full'
                      disabled={!isMaxBidValid || isSettingMaxBid || isClosed || isTimeEnded}
                      onClick={() => setConfirmMaxBidOpen(true)}
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

      <AlertDialog open={confirmMaxBidOpen} onOpenChange={setConfirmMaxBidOpen}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Set max bid?</AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ll automatically bid on your behalf up to{' '}
              <span className='font-medium text-foreground'>
                GHS {Number.isFinite(parsedMaxBid) ? parsedMaxBid.toFixed(2) : '0.00'}
              </span>{' '}
              as others bid on this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMaxBid}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmBuyNowOpen} onOpenChange={setConfirmBuyNowOpen}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Buy this item now?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll purchase <span className='font-medium text-foreground'>{lot.title}</span> immediately for{' '}
              <span className='font-medium text-foreground'>GHS {(lot.buyNowPrice ?? 0).toFixed(2)}</span>, ending the auction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBuyNow}>Buy Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
