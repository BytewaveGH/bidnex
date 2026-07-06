'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Loader2, PackageSearch, RefreshCw, WifiOff } from 'lucide-react'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'
import { useWatchlistIds } from '@/components/generals/providers/watchlist-provider'
import { showToast } from '@/components/templates/toast-template'
import { cn } from '@/lib/utils'
import { useLotStream } from '../_logics/useLotStream'
import { useLotStreamUpdates } from '../_logics/useLotStreamUpdates'
import { useStreamActions } from '../_logics/useStreamActions'
import type { StreamLot } from '../_logics/stream-types'
import LotReelCard from './lot-reel-card'
import StreamFilterBar from './stream-filter-bar'

const RENDER_WINDOW_BEHIND = 3
const RENDER_WINDOW_AHEAD = 3
const PREFETCH_THRESHOLD = 4

function subscribeToConnectivity(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function useIsOnline() {
  return useSyncExternalStore(
    subscribeToConnectivity,
    () => navigator.onLine,
    () => true,
  )
}

function CenteredMessage({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center text-white">
      {icon}
      <p className="text-sm text-white/80">{title}</p>
      {action}
    </div>
  )
}

export default function BidStream() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const isLoggedIn = session?.user?.userType === 'bidder'

  const {
    lots,
    currentIndex,
    setCurrentIndex,
    isExhausted,
    status,
    error: streamError,
    filters,
    setFilterValue,
    watchedIds,
    setWatched,
    seedWatchedIds,
    patchLot,
    insertLotFirst,
    maybeFetchMore,
    restart,
  } = useLotStream()
  const actions = useStreamActions()
  const { watchlistIds } = useWatchlistIds()
  const unauthApi = useUnauthenticatedAxios()

  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const isOnline = useIsOnline()
  // Stream-wide, like Reels/TikTok — tapping mute on any card keeps that
  // preference as the user swipes. Defaults to on; browsers that block
  // unmuted autoplay without a fresh gesture fall back to muted playback
  // until the user interacts (see LotMediaCarousel).
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (watchlistIds.size) seedWatchedIds(watchlistIds)
    // seed once whenever the shared context gains ids — safe to re-run, it only adds.
  }, [watchlistIds, seedWatchedIds])

  // "Return to this lot after login" — fetch it once and pin it to the front.
  const returnLotId = Number(searchParams.get('lot')) || null
  const handledReturnRef = useRef(false)
  useEffect(() => {
    if (!returnLotId || handledReturnRef.current) return
    handledReturnRef.current = true
    void (async () => {
      try {
        const res: any = await unauthApi({ method: 'GET', url: `/public/lots/${returnLotId}` })
        if (res.status < 400 && res.data?.data) insertLotFirst(res.data.data)
      } catch {
        // best-effort — the normal stream load still proceeds
      }
    })()
  }, [returnLotId, unauthApi, insertLotFirst])

  const requireAuth = useCallback(
    (lotId: number) => {
      const redirectTo = `/bidder/bid-stream?lot=${lotId}`
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
    },
    [router],
  )

  const activeLot = lots[currentIndex]
  useLotStreamUpdates(activeLot, patchLot)

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = containerRef.current
      if (!el || el.clientHeight === 0) return
      const idx = Math.round(el.scrollTop / el.clientHeight)
      setCurrentIndex((prev) => (prev === idx ? prev : idx))
    })
  }, [setCurrentIndex])

  // Silently fetch the next batch once we're within reach of the end of the batch.
  useEffect(() => {
    if (!isOnline) return
    if (lots.length === 0) return
    if (lots.length - currentIndex <= PREFETCH_THRESHOLD) {
      maybeFetchMore()
    }
  }, [currentIndex, lots.length, isOnline, maybeFetchMore])

  async function handleBid(lot: StreamLot, amount: number) {
    const result = await actions.placeBid(lot.id, amount)
    if (result.ok) {
      patchLot(lot.id, { currentBid: amount, bidCount: lot.bidCount + 1 })
    } else if (result.status === 401) {
      requireAuth(lot.id)
    }
    return result
  }

  async function handleSetMaxBid(lot: StreamLot, amount: number) {
    const result = await actions.setMaxBid(lot.id, amount)
    if (result.status === 401) requireAuth(lot.id)
    return result
  }

  async function handleBuyNow(lot: StreamLot): Promise<boolean> {
    const result = await actions.buyNow(lot.id)
    if (result.ok) {
      patchLot(lot.id, { status: 'sold' })
      showToast('success', 'Purchase successful! This item is yours.')
      return true
    }
    if (result.status === 401) {
      requireAuth(lot.id)
    } else {
      showToast('failure', result.error ?? 'Failed to complete purchase.')
    }
    return false
  }

  async function handleToggleWatch(lot: StreamLot) {
    const currentlyWatched = watchedIds.has(lot.id)
    setWatched(lot.id, !currentlyWatched)
    const result = await actions.setWatch(lot.id, !currentlyWatched)
    if (!result.ok) {
      setWatched(lot.id, currentlyWatched)
      if (result.status === 401) requireAuth(lot.id)
      else showToast('failure', result.error ?? 'Failed to update watchlist.')
    } else {
      showToast('success', currentlyWatched ? 'Removed from your watchlist.' : 'Added to your watchlist.')
    }
  }

  if (status === 'loading' && lots.length === 0) {
    return (
      <CenteredMessage
        icon={<Loader2 className="h-6 w-6 animate-spin text-white/70" />}
        title="Loading the auction floor…"
      />
    )
  }

  if (status === 'error') {
    return (
      <button type="button" className="block w-full" onClick={() => restart()}>
        <CenteredMessage
          icon={<RefreshCw className="h-6 w-6 text-white/70" />}
          title={`Could not load — tap to retry${streamError ? ` (${streamError})` : ''}`}
        />
      </button>
    )
  }

  if (status === 'ready' && lots.length === 0) {
    return (
      <CenteredMessage
        icon={<PackageSearch className="h-10 w-10 text-white/50" />}
        title="No active lots right now. Check back soon."
      />
    )
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {!isOnline && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-center gap-2 bg-[#D42620] py-2 text-xs font-semibold text-white">
          <WifiOff className="h-3.5 w-3.5" />
          No connection — showing the last known state.
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 z-20 bg-linear-to-b from-black/70 to-transparent pb-4',
          !isOnline ? 'top-8' : 'top-0',
        )}
      >
        <div className="pointer-events-auto flex items-center gap-2 px-2 pt-3">
          <button
            type="button"
            onClick={() => router.push('/bidder/all-items')}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-white">BidStream</span>
        </div>
        <StreamFilterBar filters={filters} onChange={setFilterValue} />
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-dvh w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth"
      >
        {lots.map((lot, i) => {
          const inWindow = i >= currentIndex - RENDER_WINDOW_BEHIND && i <= currentIndex + RENDER_WINDOW_AHEAD
          return (
            <div key={lot.id} className="h-dvh w-full snap-start">
              {inWindow ? (
                <LotReelCard
                  lot={lot}
                  isActive={i === currentIndex}
                  isLoggedIn={isLoggedIn}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((m) => !m)}
                  isWatched={watchedIds.has(lot.id)}
                  isWatchPending={actions.isWatchPending(lot.id)}
                  onToggleWatch={() => handleToggleWatch(lot)}
                  onBid={(amount) => handleBid(lot, amount)}
                  bidState={actions.getBidState(lot.id)}
                  onClearBidError={() => actions.clearBidError(lot.id)}
                  onSetMaxBid={(amount) => handleSetMaxBid(lot, amount)}
                  maxBidState={actions.getMaxBidState(lot.id)}
                  onClearMaxBidError={() => actions.clearMaxBidError(lot.id)}
                  onBuyNow={() => handleBuyNow(lot)}
                  onRequireAuth={() => requireAuth(lot.id)}
                  isBuyingNow={actions.getBuyNowState(lot.id).loading}
                />
              ) : null}
            </div>
          )
        })}

        {isExhausted && (
          <div className="h-dvh w-full snap-start">
            <CenteredMessage
              icon={<RefreshCw className="h-6 w-6 text-white/70" />}
              title="You've seen everything — pull to refresh."
              action={
                <button
                  type="button"
                  onClick={() => restart()}
                  className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black"
                >
                  Refresh
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
