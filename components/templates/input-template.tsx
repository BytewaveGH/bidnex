import React from 'react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

export default function InputTemplate(
    { className, placeholder }: { className?: string, placeholder: string }
) {
  return (
    <Input placeholder={placeholder} className={cn("w-full text-[#667185] text-sm  placeholder:text-[#667185] ", className)} />
  )
}