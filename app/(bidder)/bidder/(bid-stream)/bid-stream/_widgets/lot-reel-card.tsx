'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ButtonTemplate from '@/components/templates/button-template'
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
import { cn } from '@/lib/utils'
import {
  formatGHS,
  minNextBid,
  streamMediaItems,
  type StreamLot,
} from '../_logics/stream-types'
import type { ActionResult } from '../_logics/useStreamActions'
import LotMediaCarousel from './lot-media-carousel'
import ReelActionRail from './reel-action-rail'
import ReelInfoPanel from './reel-info-panel'

type ActionState = { loading: boolean; error: string | null }

type LotReelCardProps = {
  lot: StreamLot
  isActive: boolean
  isLoggedIn: boolean
  isWinning: boolean
  isOutbid: boolean
  isWon: boolean
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
  className?: string
}

export default function LotReelCard({
  lot,
  isActive,
  isLoggedIn,
  isWinning,
  isOutbid,
  isWon,
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
  className,
}: LotReelCardProps) {
  const router = useRouter()
  const [confirmBuyNowOpen, setConfirmBuyNowOpen] = useState(false)
  const [confirmMaxBidOpen, setConfirmMaxBidOpen] = useState(false)
  const [maxBidInput, setMaxBidInput] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showChrome, setShowChrome] = useState(true)
  const mediaItems = useMemo(() => streamMediaItems(lot), [lot])
  const isClosed = lot.status !== 'active' && lot.status !== 'pending'
  const suggestedBid = minNextBid(lot)
  const parsedMaxBid = Number(maxBidInput)
  const isMaxBidValid = maxBidInput.trim() !== '' && Number.isFinite(parsedMaxBid) && parsedMaxBid >= suggestedBid

  async function handleConfirmBuyNow() {
    setConfirmBuyNowOpen(false)
    await onBuyNow()
  }

  async function handleConfirmMaxBid() {
    setConfirmMaxBidOpen(false)
    const result = await onSetMaxBid(parsedMaxBid)
    if (result.ok) setMaxBidInput('')
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

  return (
    <div className={cn('relative h-full w-full snap-start snap-always overflow-hidden bg-black', className)}>
      <div className="absolute inset-0">
        <LotMediaCarousel
          items={mediaItems}
          alt={lot.title}
          isActive={isActive}
          isMuted={isMuted}
          onActiveImageIndexChange={setActiveImageIndex}
          onTapMedia={() => setShowChrome((v) => !v)}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30" />
      </div>

      {isClosed && !isWon && (
        <div className="absolute top-4 left-4 z-10 rounded-full bg-[#D96B6B] px-3 py-1.5 text-xs font-bold text-white">
          {lot.status.toUpperCase()}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 pb-6 text-white">
        {mediaItems.length > 1 && (
          <div
            className={cn(
              'flex justify-center gap-1.5 transition-opacity duration-200',
              !showChrome && 'pointer-events-none opacity-0',
            )}
          >
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

        <ReelInfoPanel
          className={cn('max-w-[75%] transition-opacity duration-200 lg:hidden', !showChrome && 'pointer-events-none opacity-0')}
          lot={lot}
          onOpenProduct={() => router.push(`/bidder/product/${lot.id}`)}
          isWon={isWon}
          isWinning={isWinning}
          isOutbid={isOutbid}
        />

        {!isClosed && (
          <div
            className={cn('relative transition-opacity duration-200', !showChrome && 'pointer-events-none opacity-0')}
            onClick={(e) => e.stopPropagation()}
          >
            <ReelActionRail
              className="absolute right-0 bottom-full z-20 mb-4 lg:hidden"
              lot={lot}
              hasVideo={mediaItems.some((item) => item.type === 'video')}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              isLoggedIn={isLoggedIn}
              isWatched={isWatched}
              isWatchPending={isWatchPending}
              onToggleWatch={onToggleWatch}
              onRequireAuth={onRequireAuth}
            />

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
                    disabled={bidState.loading || isClosed || isWinning}
                    className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                      width: lot.buyNowPrice ? '72%' : '100%',
                      backgroundColor: isWinning ? '#099137' : '#000',
                      clipPath: lot.buyNowPrice ? 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' : undefined,
                    }}
                  >
                    {bidState.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Bid ${formatGHS(suggestedBid)}`}
                  </button>

                  {!!lot.buyNowPrice && (
                    <button
                      type="button"
                      onClick={handleBuyNowClick}
                      disabled={isBuyingNow || isClosed}
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
                      disabled={!isMaxBidValid || maxBidState.loading || isClosed}
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
