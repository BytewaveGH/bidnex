import React from 'react'
import { cn } from '@/lib/utils'

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("text-3xl font-semibold shrink-0 " , className)}>BIDNEX</div>
  )
}