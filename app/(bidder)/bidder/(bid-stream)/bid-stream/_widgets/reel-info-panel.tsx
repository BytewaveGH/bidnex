'use client'

import { useEffect, useRef, useState } from 'react'
import { AlarmClock, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLotCondition } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'
import { formatGHS, formatStreamCountdown, type StreamLot } from '../_logics/stream-types'

function conditionColor(condition: string): string {
  if (condition === 'new' || condition === 'like_new') return 'bg-[#099137]'
  if (condition === 'good_condition') return 'bg-[#003C71]'
  return 'bg-[#D42620]'
}

type Variant = 'dark' | 'light'

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

function ReelTitle({ title, onOpen, variant }: { title: string; onOpen: () => void; variant: Variant }) {
  return (
    <h2
      className={cn(
        'cursor-pointer text-base font-semibold hover:underline',
        variant === 'light' && 'text-black',
      )}
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
    >
      {title}
    </h2>
  )
}

function ReelCountdown({ endTime, variant }: { endTime: string | null; variant: Variant }) {
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
    return (
      <span
        className={cn(
          'rounded-full px-3 py-1 text-xs font-semibold',
          variant === 'light' ? 'bg-black/5 text-black' : 'bg-white/15 text-white backdrop-blur-sm',
        )}
      >
        Ended
      </span>
    )
  }
  if (!countdown.label) return null
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums whitespace-nowrap',
        countdown.urgent
          ? 'bg-[#D42620] text-white font-semibold'
          : variant === 'light'
            ? 'border border-black/10 bg-black/5 text-black'
            : 'border border-white/25 bg-white/15 text-white backdrop-blur-sm',
      )}
    >
      <AlarmClock className="h-3.5 w-3.5" />
      {countdown.label}
    </span>
  )
}

type ReelInfoPanelProps = {
  lot: StreamLot
  onOpenProduct: () => void
  isWon: boolean
  isWinning: boolean
  isOutbid: boolean
  className?: string
  /** 'dark' (default) is the mobile look, overlaid on the video's gradient
   * scrim. 'light' is for the desktop panel sitting on the plain page bg. */
  variant?: Variant
}

/** Category/countdown/bids chips + title + current bid — rendered inline
 * over the card on mobile, and as a standalone panel beside the letterboxed
 * card on desktop (see LotReelCard and BidStream), mirroring the action rail
 * on the other side. */
export default function ReelInfoPanel({
  lot,
  onOpenProduct,
  isWon,
  isWinning,
  isOutbid,
  className,
  variant = 'dark',
}: ReelInfoPanelProps) {
  return (
    <div className={cn('flex flex-col gap-3', variant === 'light' ? 'text-black' : 'text-white', className)}>
      <div>
        <span className={cn('inline-block rounded-full px-3 py-1 text-xs font-semibold text-white', conditionColor(lot.condition))}>
          {formatLotCondition(lot.condition)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {lot.category?.name && (
          <span
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
              variant === 'light' ? 'bg-black/5 text-black' : 'border border-white/25 bg-white/15 backdrop-blur-sm',
            )}
          >
            {lot.category.name}
          </span>
        )}
        <div className="shrink-0">
          <ReelCountdown endTime={lot.bidEndTime} variant={variant} />
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
            variant === 'light' ? 'bg-black/5 text-black' : 'border border-white/25 bg-white/15 backdrop-blur-sm',
          )}
        >
          <UsersRound className="h-3.5 w-3.5" />
          {lot.bidCount} bids
        </span>
      </div>

      <ReelTitle title={lot.title} onOpen={onOpenProduct} variant={variant} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('text-sm', variant === 'light' ? 'text-black/60' : 'text-white/70')}>Current bid</p>
          {isWon && (
            <span className="rounded-full bg-[#099137] px-2 py-0.5 text-[10px] font-bold text-white">WON</span>
          )}
          {isWinning && !isWon && (
            <span className="rounded-full bg-[#099137] px-2 py-0.5 text-[10px] font-bold text-white">WINNING</span>
          )}
          {isOutbid && (
            <span className="rounded-full bg-[#F3A218] px-2 py-0.5 text-[10px] font-bold text-white">OUTBID</span>
          )}
        </div>
        <p className="-mt-1 text-xl font-bold">
          <AnimatedAmount value={lot.currentBid} />
        </p>
        {lot.msrp != null && (
          <p className={cn('mt-0.5 text-xs', variant === 'light' ? 'text-black/50' : 'text-white/60')}>
            MKT PR: {formatGHS(lot.msrp)}
          </p>
        )}
      </div>
    </div>
  )
}
