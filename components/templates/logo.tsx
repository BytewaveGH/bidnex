'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logoLight from '@/assets/images/logo_black.png'
import logoDark from '@/assets/images/logo_white.png'

export default function Logo({
  className,
  variant = 'auto',
}: {
  className?: string
  variant?: 'auto' | 'light' | 'dark'
}) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push('/')}
      className={cn('text-2xl font-semibold shrink-0 hover:cursor-pointer flex gap-1', className)}
    >
      {variant === 'auto' ? (
        <>
          <Image src={logoLight} alt="logo" width={100} height={22} className="block dark:hidden" />
          <Image src={logoDark} alt="logo" width={100} height={22} className="hidden dark:block" />
        </>
      ) : (
        <Image
          src={variant === 'dark' ? logoDark : logoLight}
          alt="logo"
          width={100}
          height={22}
        />
      )}
    </div>
  )
}
