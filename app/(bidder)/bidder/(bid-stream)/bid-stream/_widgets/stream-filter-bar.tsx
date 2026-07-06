'use client'

import { usePublicCategories } from '@/app/(vendor)/vendor/(studio)/dashboard/lots/_logics/usePublicCategories'
import { cn } from '@/lib/utils'
import type { StreamFilters } from '../_logics/stream-types'

type StreamFilterBarProps = {
  filters: StreamFilters
  onChange: (next: Partial<StreamFilters>) => void
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors',
        active ? 'bg-white text-black' : 'bg-white/15 text-white hover:bg-white/25',
      )}
    >
      {children}
    </button>
  )
}

export default function StreamFilterBar({ filters, onChange }: StreamFilterBarProps) {
  const { categories } = usePublicCategories()

  return (
    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
      <Pill active={!filters.buyNow} onClick={() => onChange({ buyNow: false })}>
        All
      </Pill>
      <Pill active={filters.buyNow} onClick={() => onChange({ buyNow: true })}>
        Buy Now
      </Pill>
      <div className="h-5 w-px shrink-0 bg-white/25" />
      <Pill active={filters.categoryId === null} onClick={() => onChange({ categoryId: null })}>
        All categories
      </Pill>
      {categories.map((category) => (
        <Pill
          key={category.id}
          active={filters.categoryId === category.id}
          onClick={() => onChange({ categoryId: category.id })}
        >
          {category.name}
        </Pill>
      ))}
    </div>
  )
}
