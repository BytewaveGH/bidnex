'use client'

import Image from 'next/image'
import { Loader2, Share2, Volume2, VolumeX } from 'lucide-react'
import ButtonTemplate from '@/components/templates/button-template'
import { showToast } from '@/components/templates/toast-template'
import eyeIcon from '@/assets/svgs/eye.svg'
import { cn } from '@/lib/utils'
import type { StreamLot } from '../_logics/stream-types'

type ReelActionRailProps = {
  lot: StreamLot
  hasVideo: boolean
  isMuted: boolean
  onToggleMute: () => void
  isLoggedIn: boolean
  isWatched: boolean
  isWatchPending: boolean
  onToggleWatch: () => void
  onRequireAuth: () => void
  className?: string
}

/** Mute/share/watchlist buttons for a reel — rendered inline over the card on
 * mobile, and as a standalone rail beside the letterboxed card on desktop
 * (see LotReelCard and BidStream). */
export default function ReelActionRail({
  lot,
  hasVideo,
  isMuted,
  onToggleMute,
  isLoggedIn,
  isWatched,
  isWatchPending,
  onToggleWatch,
  onRequireAuth,
  className,
}: ReelActionRailProps) {
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

  function handleWatchClick() {
    if (!isLoggedIn) return onRequireAuth()
    onToggleWatch()
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} onClick={(e) => e.stopPropagation()}>
      {hasVideo && (
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
  )
}
