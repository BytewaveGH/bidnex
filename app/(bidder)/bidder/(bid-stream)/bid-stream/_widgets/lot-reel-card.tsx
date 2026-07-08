'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlarmClock, Loader2, Share2, UsersRound, Volume2, VolumeX } from 'lucide-react'
import ButtonTemplate from '@/components/templates/button-template'
import InputTemplate from '@/components/templates/input-template'
import { showToast } from '@/components/templates/toast-template'
import eyeIcon from '@/assets/svgs/eye.svg'
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
import { cn } from '@/lib/utils'
import {
  formatGHS,
  formatStreamCountdown,
  minNextBid,
  streamMediaItems,
  type StreamLot,
} from '../_logics/stream-types'
import type { ActionResult } from '../_logics/useStreamActions'
import LotMediaCarousel from './lot-media-carousel'

function AnimatedAmount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === value) return
    const start = performance.now()
    const duration = 450

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value])

  return <span className="tabular-nums">{formatGHS(display)}</span>
}

function ReelCountdown({ endTime }: { endTime: string | null }) {
  const [countdown, setCountdown] = useState(() => formatStreamCountdown(endTime))

  useEffect(() => {
    function tick() {
      setCountdown(formatStreamCountdown(endTime))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  if (countdown.ended) {
    return <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">Ended</span>
  }
  if (!countdown.label) return null
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums whitespace-nowrap',
        countdown.urgent ? 'bg-[#D42620] text-white font-semibold' : 'border border-white/25 bg-white/15 text-white backdrop-blur-sm',
      )}
    >
      <AlarmClock className="h-3.5 w-3.5" />
      {countdown.label}
    </span>
  )
}

type ActionState = { loading: boolean; error: string | null }

type LotReelCardProps = {
  lot: StreamLot
  isActive: boolean
  isLoggedIn: boolean
  isMuted: boolean
  onToggleMute: () => void
  isWatched: boolean
  isWatchPending: boolean
  onToggleWatch: () => void
  onBid: (amount: number) => Promise<ActionResult>
  bidState: ActionState
  onClearBidError: () => void
  onSetMaxBid: (amount: number) => Promise<ActionResult>
  maxBidState: ActionState
  onClearMaxBidError: () => void
  onBuyNow: () => Promise<boolean>
  onRequireAuth: () => void
  isBuyingNow: boolean
}

export default function LotReelCard({
  lot,
  isActive,
  isLoggedIn,
  isMuted,
  onToggleMute,
  isWatched,
  isWatchPending,
  onToggleWatch,
  onBid,
  bidState,
  onClearBidError,
  onSetMaxBid,
  maxBidState,
  onClearMaxBidError,
  onBuyNow,
  onRequireAuth,
  isBuyingNow,
}: LotReelCardProps) {
  const router = useRouter()
  const [confirmBuyNowOpen, setConfirmBuyNowOpen] = useState(false)
  const [confirmMaxBidOpen, setConfirmMaxBidOpen] = useState(false)
  const [maxBidInput, setMaxBidInput] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const mediaItems = useMemo(() => streamMediaItems(lot), [lot])
  const isClosed = lot.status !== 'active' && lot.status !== 'pending'
  const suggestedBid = minNextBid(lot)
  const parsedMaxBid = Number(maxBidInput)
  const isMaxBidValid = maxBidInput.trim() !== '' && Number.isFinite(parsedMaxBid) && parsedMaxBid > 0

  async function handleConfirmBuyNow() {
    setConfirmBuyNowOpen(false)
    await onBuyNow()
  }

  async function handleConfirmMaxBid() {
    setConfirmMaxBidOpen(false)
    const result = await onSetMaxBid(parsedMaxBid)
    if (result.ok) setMaxBidInput('')
  }

  function handleWatchClick() {
    if (!isLoggedIn) return onRequireAuth()
    onToggleWatch()
  }

  function handleBuyNowClick() {
    if (!isLoggedIn) return onRequireAuth()
    setConfirmBuyNowOpen(true)
  }

  async function handleBidClick() {
    if (!isLoggedIn) return onRequireAuth()
    await onBid(suggestedBid)
  }

  function handleSetMaxBidClick() {
    if (!isLoggedIn) return onRequireAuth()
    setConfirmMaxBidOpen(true)
  }

  async function handleShare() {
    const url = `${window.location.origin}/bidder/bid-stream?lot=${lot.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: lot.title, text: `Check out ${lot.title} on BidChale`, url })
      } catch {
        // user dismissed the native share sheet — nothing to do
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('success', 'Link copied to clipboard.')
    } catch {
      showToast('failure', 'Could not copy the link.')
    }
  }

  return (
    <div className="relative h-full w-full snap-start snap-always overflow-hidden bg-black">
      <div className="absolute inset-0">
        <LotMediaCarousel
          items={mediaItems}
          alt={lot.title}
          isActive={isActive}
          isMuted={isMuted}
          onActiveImageIndexChange={setActiveImageIndex}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30" />
      </div>

      {isClosed && (
        <div className="absolute top-4 left-4 z-10 rounded-full bg-[#D96B6B] px-3 py-1.5 text-xs font-bold text-white">
          {lot.status.toUpperCase()}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 pb-6 text-white">
        {mediaItems.length > 1 && (
          <div className="flex justify-center gap-1.5">
            {mediaItems.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  i === activeImageIndex ? 'bg-white' : 'bg-white/40',
                )}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0">
          {lot.category?.name && (
            <span className="min-w-0 shrink truncate whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {lot.category.name}
            </span>
          )}
          <div className="shrink-0">
            <ReelCountdown endTime={lot.bidEndTime} />
          </div>
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <UsersRound className="h-3.5 w-3.5" />
            {lot.bidCount} bids
          </span>
        </div>

        <h2
          className="line-clamp-2 text-2xl font-bold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/bidder/product/${lot.id}`)
          }}
        >
          {lot.title}
        </h2>

        <p className="text-sm text-white/70">Current bid</p>
        <div className="relative -mt-2">
          <p className="text-3xl font-bold">
            <AnimatedAmount value={lot.currentBid} />
          </p>

         
        </div>

        {!isClosed && (
          <div className="relative " onClick={(e) => e.stopPropagation()}>
            <div
              className="absolute right-0 bottom-full mb-4 z-20 flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems.some((item) => item.type === 'video') && (
                <button
                  type="button"
                  onClick={onToggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0F2F5] bg-white text-black"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0F2F5] bg-white text-black"
              >
                <Share2 className="h-5 w-5" />
              </button>
              {isLoggedIn && (
                <ButtonTemplate
                  title={
                    isWatchPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#344054]" />
                    ) : (
                      <Image
                        src={eyeIcon}
                        alt="watchlist"
                        className="w-5 h-5"
                        style={isWatched ? { filter: 'brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(1475%) hue-rotate(1deg) brightness(110%)' } : undefined}
                      />
                    )
                  }
                  className="bg-white text-black hover:bg-white h-10 w-10 border border-[#F0F2F5] rounded-full p-0"
                  onClick={handleWatchClick}
                  disabled={isWatchPending}
                />
              )}
            </div>

            {!isLoggedIn && (
              <ButtonTemplate
                title="Login to Bid"
                className="bg-black text-white hover:bg-black w-full h-12"
                onClick={onRequireAuth}
              />
            )}

            {isLoggedIn && (
              <>
                <div className="relative h-12 rounded-[6px] overflow-hidden">
                  <button
                    type="button"
                    onClick={handleBidClick}
                    disabled={bidState.loading}
                    className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                      width: lot.buyNowPrice ? '72%' : '100%',
                      backgroundColor: '#000',
                      clipPath: lot.buyNowPrice ? 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' : undefined,
                    }}
                  >
                    {bidState.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Bid ${formatGHS(suggestedBid)}`}
                  </button>

                  {!!lot.buyNowPrice && (
                    <button
                      type="button"
                      onClick={handleBuyNowClick}
                      disabled={isBuyingNow}
                      className="absolute inset-y-0 right-0 flex flex-col items-center justify-center bg-[#003C71] text-white text-[10px] leading-tight font-semibold hover:brightness-110 transition-[filter] px-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                      style={{ width: 'calc(28% + 14px)', clipPath: 'polygon(16px 0, 100% 0, 100% 100%, 0 100%)' }}
                    >
                      {isBuyingNow ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Buy Now</span>
                          <span>{formatGHS(lot.buyNowPrice)}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {bidState.error && (
                  <p className="mt-1 cursor-pointer text-xs text-[#D42620]" onClick={onClearBidError}>
                    {bidState.error}
                  </p>
                )}
                {maxBidState.error && (
                  <p className="mt-1 cursor-pointer text-xs text-[#D42620]" onClick={onClearMaxBidError}>
                    {maxBidState.error}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <InputTemplate
                      placeholder="GHS0.00"
                      className="h-9 w-full shadow-none"
                      inputAlign="center"
                      type="number"
                      value={maxBidInput}
                      onChange={(e) => setMaxBidInput(e.target.value)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <ButtonTemplate
                      title={maxBidState.loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Set Max Bid'}
                      className="h-9 w-full bg-[#FFCC00] text-black hover:bg-[#FFCC00]"
                      disabled={!isMaxBidValid || maxBidState.loading}
                      onClick={handleSetMaxBidClick}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={confirmBuyNowOpen} onOpenChange={setConfirmBuyNowOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Buy this item now?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll purchase <span className="font-medium text-foreground">{lot.title}</span> immediately for{' '}
              <span className="font-medium text-foreground">{formatGHS(lot.buyNowPrice ?? 0)}</span>, ending the
              auction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBuyNow}>Buy Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMaxBidOpen} onOpenChange={setConfirmMaxBidOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Set max bid?</AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ll automatically bid on your behalf up to{' '}
              <span className="font-medium text-foreground">
                {formatGHS(Number.isFinite(parsedMaxBid) ? parsedMaxBid : 0)}
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
    </div>
  )
}
