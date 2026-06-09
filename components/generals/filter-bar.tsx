'use client'

import React from 'react'
import MultiSelectTemplate from '../templates/multi-select-template'
import PriceSelectTemplate from '../templates/price-select-template'
import SelectTemplate from '../templates/select-template'
import { usePublicCategories } from '@/app/(vendor)/vendor/(studio)/dashboard/lots/_logics/usePublicCategories'

type FilterBarProps = {
  onCategoryChange?: (categoryId: number | undefined) => void
  onConditionChange?: (condition: string | undefined) => void
  onPriceChange?: (min: number | undefined, max: number | undefined) => void
  defaultCategory?: string[]
  defaultCondition?: string[]
  defaultPrice?: string[]
}

function parsePriceRange(values: string[]): { min: number | undefined; max: number | undefined } {
  if (values.length === 0) return { min: undefined, max: undefined }
  let min: number | undefined
  let max: number | undefined
  for (const v of values) {
    if (v.startsWith('under-')) {
      const n = parseInt(v.slice(6), 10)
      if (!isNaN(n) && (max === undefined || n > max)) max = n
    } else {
      const parts = v.split('-')
      if (parts.length === 2) {
        const lo = parseInt(parts[0], 10)
        const hi = parseInt(parts[1], 10)
        if (!isNaN(lo) && (min === undefined || lo < min)) min = lo
        if (!isNaN(hi) && (max === undefined || hi > max)) max = hi
      }
    }
  }
  return { min, max }
}

export default function FilterBar({
  onCategoryChange,
  onConditionChange,
  onPriceChange,
  defaultCategory = [],
  defaultCondition = [],
  defaultPrice = [],
}: FilterBarProps) {
  const { categories } = usePublicCategories()

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: String(c.id),
  }))

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <div className="w-[250px]">
          <MultiSelectTemplate
            options={categoryOptions}
            onValueChange={(values) => {
              const id = values[0] ? parseInt(values[0], 10) : undefined
              onCategoryChange?.(isNaN(id as number) ? undefined : id)
            }}
            defaultValue={defaultCategory}
            placeholder="Category"
          />
        </div>
        <div className="w-[250px]">
          <MultiSelectTemplate
            options={[
              { label: 'New / Like New', value: 'new' },
              { label: 'Good Condition', value: 'used' },
              { label: 'AS IS', value: 'as_is' },
            ]}
            onValueChange={(values) => {
              onConditionChange?.(values[0] ?? undefined)
            }}
            defaultValue={defaultCondition}
            placeholder="Condition"
          />
        </div>
        <div className="w-[250px]">
          <PriceSelectTemplate
            options={[
              { label: 'Under GHS50', value: 'under-50' },
              { label: 'GHS50 to GHS100', value: '50-100' },
              { label: 'GHS100 to GHS300', value: '100-300' },
              { label: 'GHS300 to GHS500', value: '300-500' },
              { label: 'GHS500 to GHS1,000', value: '500-1000' },
              { label: 'GHS1,000 to GHS10,000', value: '1000-10000' },
            ]}
            onValueChange={(values) => {
              const { min, max } = parsePriceRange(values)
              onPriceChange?.(min, max)
            }}
            defaultValue={defaultPrice}
            placeholder="Price"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SelectTemplate
          options={[
            { label: 'Ending Soonest', value: 'ending-soonest' },
            { label: 'Ending Latest', value: 'ending-latest' },
          ]}
          placeholder="Ending soonest"
        />
      </div>
    </div>
  )
}
