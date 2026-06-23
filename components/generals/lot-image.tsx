'use client'

import { memo, useState } from 'react'
import Image from 'next/image'

type LotImageProps = {
  src: string
  alt: string
  className?: string
  sizes?: string
}

function resolveUrl(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}/${src}`
}

function LotImageComponent({ src, alt, className, sizes }: LotImageProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedSrc = src ? resolveUrl(src) : ''

  if (!resolvedSrc || imgError) {
    return (
      <div className="w-full h-full bg-[#f1f1f1] flex items-center justify-center">
        <span className="text-[#98A2B3] text-sm">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setImgError(true)}
    />
  )
}

export const LotImage = memo(
  LotImageComponent,
  (prev, next) =>
    prev.src === next.src &&
    prev.alt === next.alt &&
    prev.className === next.className &&
    prev.sizes === next.sizes,
)
