'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function Logo({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <div
    onClick={() => router.push('/')}
    className={cn("text-3xl font-semibold shrink-0 hover:cursor-pointer " , className)}>BIDNEX</div>
  )
}