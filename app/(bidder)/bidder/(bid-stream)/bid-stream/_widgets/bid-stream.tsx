'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Loader2, PackageSearch, RefreshCw, WifiOff } from 'lucide-react'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'
import { useWatchlistIds } from '@/components/generals/providers/watchlist-provider'
import { showToast } from '@/components/templates/toast-template'
import TopNav from '@/components/generals/top-nav'
import { cn } from '@/lib/utils'
import { useLotStream } from '../_logics/useLotStream'
import { useLotStreamUpdates } from '../_logics/useLotStreamUpdates'
import { useStreamActions } from '../_logics/useStreamActions'
import { deriveLotStanding, streamMediaItems, type StreamLot } from '../_logics/stream-types'
import LotReelCard from './lot-reel-card'
import ReelActionRail from './reel-action-rail'
import ReelInfoPanel from './reel-info-panel'
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center text-white">
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
  const currentUserId = Number((session?.user as any)?.userId)

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
      patchLot(lot.id, {
        currentBid: amount,
        bidCount: lot.bidCount + 1,
        winnerId: currentUserId,
        bidderIds: lot.bidderIds.includes(currentUserId) ? lot.bidderIds : [...lot.bidderIds, currentUserId],
      })
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
      patchLot(lot.id, { status: 'sold', winnerId: currentUserId })
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

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-black lg:bg-white">
      {!isOnline && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-center gap-2 bg-[#D42620] py-2 text-xs font-semibold text-white">
          <WifiOff className="h-3.5 w-3.5" />
          No connection — showing the last known state.
        </div>
      )}

      {/* Desktop: the site's own navbar, in normal document flow — just
          like every other page. Categories stay on the card itself below. */}
      <div className="hidden shrink-0 lg:block">
        <TopNav />
      </div>

      {/* Mobile-only scrim + header, overlaid on the reel — desktop's
          categories overlay (on the card) is set up further down. */}
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 z-20 bg-linear-to-b from-black/70 to-transparent pb-4 lg:hidden',
          !isOnline ? 'top-8' : 'top-0',
        )}
      >
        <div className="pointer-events-auto flex items-center gap-2 px-4 pt-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Home"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <Home className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-white">BidStream</span>
        </div>
        <StreamFilterBar filters={filters} onChange={setFilterValue} />
      </div>

      {/* The reel itself fills whatever's left after the navbar/categories
          on desktop (full height on mobile, since those are hidden there).
          The `lg:p-4` gap here is a static layout inset, NOT part of the
          scrollable area — each card fills its slide edge-to-edge (h-full),
          so there's no empty space inside the snap unit for scrolling to
          "eat into" and momentarily reveal the card creeping up to touch
          the navbar. */}
      <div className="relative min-h-0 flex-1 overflow-hidden lg:p-4">
        {status === 'loading' && lots.length === 0 ? (
          <CenteredMessage
            icon={<Loader2 className="h-6 w-6 animate-spin text-white/70" />}
            title="Loading the auction floor…"
          />
        ) : status === 'error' ? (
          <button type="button" className="block h-full w-full" onClick={() => restart()}>
            <CenteredMessage
              icon={<RefreshCw className="h-6 w-6 text-white/70" />}
              title={`Could not load — tap to retry${streamError ? ` (${streamError})` : ''}`}
            />
          </button>
        ) : status === 'ready' && lots.length === 0 ? (
          <CenteredMessage
            icon={<PackageSearch className="h-10 w-10 text-white/50" />}
            title="No active lots right now. Check back soon."
          />
        ) : (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {lots.map((lot, i) => {
              const inWindow = i >= currentIndex - RENDER_WINDOW_BEHIND && i <= currentIndex + RENDER_WINDOW_AHEAD
              const standing = isLoggedIn ? deriveLotStanding(lot, currentUserId) : { isWinning: false, isOutbid: false, isWon: false }
              const isClosed = lot.status !== 'active' && lot.status !== 'pending'
              return (
                <div
                  key={lot.id}
                  className="h-full w-full snap-start lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-4"
                >
                  {inWindow ? (
                    <>
                      {/* Info panel lives per-slide too (same reason as the
                          rail below) — beside the card on desktop instead of
                          overlaid on top of it, like Instagram's own side
                          caption placement. */}
                      <div className="hidden lg:mb-16 lg:-mr-3 lg:flex lg:justify-end lg:self-end">
                        <ReelInfoPanel
                          className="max-w-[280px]"
                          lot={lot}
                          onOpenProduct={() => router.push(`/bidder/product/${lot.id}`)}
                          isWon={standing.isWon}
                          isWinning={standing.isWinning}
                          isOutbid={standing.isOutbid}
                          variant="light"
                        />
                      </div>
                      {/* Aspect-locked like TikTok's own card (9:16), with
                          height as the driving dimension — width follows the
                          ratio automatically, capped so it can't blow up on
                          very tall viewports. Flush to the top of its slide
                          with a fixed 24px gap reserved at the bottom (rather
                          than filling the slide + centering, which ate into
                          during light scrolls) so scrolling between cards
                          reveals plain space, like other platforms, instead
                          of the next card's video peeking through. */}
                      <div className="relative h-full w-full lg:h-[calc(100%-24px)] lg:aspect-9/16 lg:w-auto lg:max-w-[560px]">
                        <LotReelCard
                          lot={lot}
                          isActive={i === currentIndex}
                          isLoggedIn={isLoggedIn}
                          isWinning={standing.isWinning}
                          isOutbid={standing.isOutbid}
                          isWon={standing.isWon}
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
                          className="lg:rounded-lg"
                        />
                        {/* Categories overlay lives on top of each card's own
                            box now (same element the video sizes itself
                            against), instead of a separately-positioned bar
                            with its own guessed width — that guess drifted
                            out of sync once the card's width became
                            aspect-ratio-derived rather than a fixed px value. */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden lg:block">
                          <div className="pointer-events-auto rounded-t-lg bg-linear-to-b from-black/70 to-transparent pt-3 pb-4">
                            <StreamFilterBar filters={filters} onChange={setFilterValue} />
                          </div>
                        </div>
                      </div>
                      {/* Rail lives per-slide, not as a page-level overlay, so
                          it scrolls together with its own card instead of
                          sitting fixed while the card moves underneath it. */}
                      {!isClosed && (
                        <div className="hidden lg:mb-16 lg:flex lg:justify-start lg:self-end">
                          <ReelActionRail
                            lot={lot}
                            hasVideo={streamMediaItems(lot).some((item) => item.type === 'video')}
                            isMuted={isMuted}
                            onToggleMute={() => setIsMuted((m) => !m)}
                            isLoggedIn={isLoggedIn}
                            isWatched={watchedIds.has(lot.id)}
                            isWatchPending={actions.isWatchPending(lot.id)}
                            onToggleWatch={() => handleToggleWatch(lot)}
                            onRequireAuth={() => requireAuth(lot.id)}
                          />
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )
            })}

            {isExhausted && (
              <div className="h-full w-full snap-start">
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
        )}
      </div>
    </div>
  )
}
