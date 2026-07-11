'use client'

import { usePublicCategories } from '@/app/(vendor)/vendor/(studio)/dashboard/lots/_logics/usePublicCategories'
import { cn } from '@/lib/utils'
import type { StreamFilters } from '../_logics/stream-types'

type Variant = 'dark' | 'light'

type StreamFilterBarProps = {
  filters: StreamFilters
  onChange: (next: Partial<StreamFilters>) => void
  /** 'dark' (default) is the mobile look, over the video's gradient scrim.
   * 'light' is for the desktop bar sitting on a plain white/gray page. */
  variant?: Variant
}

function Pill({
  active,
  variant,
  children,
  onClick,
}: {
  active: boolean
  variant: Variant
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
        variant === 'dark' && 'backdrop-blur-sm',
        variant === 'dark' && (active ? 'bg-white text-black' : 'bg-white/15 text-white hover:bg-white/25'),
        variant === 'light' && (active ? 'bg-[#F0F2F5] text-black' : 'text-[#344054] hover:bg-[#F0F2F5]'),
      )}
    >
      {children}
    </button>
  )
}

export default function StreamFilterBar({ filters, onChange, variant = 'dark' }: StreamFilterBarProps) {
  const { categories } = usePublicCategories()

  return (
    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
      <Pill variant={variant} active={!filters.buyNow} onClick={() => onChange({ buyNow: false })}>
        All
      </Pill>
      <Pill variant={variant} active={filters.buyNow} onClick={() => onChange({ buyNow: true })}>
        Buy Now
      </Pill>
      <div className={cn('h-5 w-px shrink-0', variant === 'dark' ? 'bg-white/25' : 'bg-black/10')} />
      <Pill variant={variant} active={filters.categoryId === null} onClick={() => onChange({ categoryId: null })}>
        All categories
      </Pill>
      {categories.map((category) => (
        <Pill
          key={category.id}
          variant={variant}
          active={filters.categoryId === category.id}
          onClick={() => onChange({ categoryId: category.id })}
        >
          {category.name}
        </Pill>
      ))}
    </div>
  )
}
