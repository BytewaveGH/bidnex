'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '@/assets/images/logo.png'

export default function Logo({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <div
    onClick={() => router.push('/')}
    className={cn("text-3xl font-semibold shrink-0 hover:cursor-pointer flex gap-1" , className)}>
        <Image src={logo} alt="logo" width={33} height={33} />
      BIDCHALE</div>
  )
}