'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { StreamMediaItem } from '../_logics/stream-types'

type LotMediaCarouselProps = {
  items: StreamMediaItem[]
  alt: string
  /** Whether the parent lot card is the one currently in view — gates video autoplay. */
  isActive: boolean
  /** Stream-wide sound preference — applied imperatively since the `muted`
   * JSX attribute doesn't reliably re-sync onto a live <video> element. */
  isMuted: boolean
  /** Reports which image is centered, so the parent can render its own dot indicator. */
  onActiveImageIndexChange?: (index: number) => void
}

export default function LotMediaCarousel({ items, alt, isActive, isMuted, onActiveImageIndexChange }: LotMediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const rafRef = useRef<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = containerRef.current
      if (!el || el.clientWidth === 0) return
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActiveImageIndex((prev) => (prev === idx ? prev : idx))
    })
  }, [])

  useEffect(() => {
    onActiveImageIndexChange?.(activeImageIndex)
  }, [activeImageIndex, onActiveImageIndexChange])

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      video.muted = isMuted
      if (isActive && i === activeImageIndex) {
        video.play().catch(() => {
          // Some browsers still refuse unmuted autoplay without a fresh
          // gesture — fall back to muted playback rather than a frozen frame.
          video.muted = true
          video.play().catch(() => {})
        })
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [isActive, activeImageIndex, isMuted])

  if (items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
        <span className="text-sm text-[#98A2B3]">No image</span>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        style={{ touchAction: 'pan-x' }}
      >
        {items.map((item, i) => (
          <div key={item.id} className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden">
            {item.type === 'video' ? (
              <video
                ref={(el) => {
                  if (el) {
                    el.muted = isMuted
                    videoRefs.current.set(i, el)
                  } else {
                    videoRefs.current.delete(i)
                  }
                }}
                src={item.url}
                muted={isMuted}
                loop
                playsInline
                preload={isActive && i === activeImageIndex ? 'auto' : 'metadata'}
                className="h-full w-full object-cover"
              />
            ) : (
              // Product photos are rarely shot in a native 9:16 ratio, so a plain
              // object-cover crop zooms in hard and can cut off most of the item.
              // Blurred backdrop fills the frame edge-to-edge while the sharp
              // foreground image stays fully visible via object-contain.
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={alt} className="relative h-full w-full object-contain" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
