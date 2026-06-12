'use client'

import { memo, useState } from 'react'
import Image from 'next/image'

type LotImageProps = {
  src: string
  alt: string
  className?: string
  sizes?: string
}

function LotImageComponent({ src, alt, className, sizes }: LotImageProps) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className="w-full h-full bg-[#f1f1f1] flex items-center justify-center">
        <span className="text-[#98A2B3] text-sm">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
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
