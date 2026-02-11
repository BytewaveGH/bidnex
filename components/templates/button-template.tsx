import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export default function ButtonTemplate(
    { className, title, onClick, disabled = false }: { className?: string, title: React.ReactNode, onClick?: () => void, disabled?: boolean }
) {
  return (
    <Button 
        disabled={disabled}
        onClick={onClick}
        className={
            cn("bg-black text-white rounded-[6px] text-sm font-semibold hover:bg-foreground hover:cursor-pointer"
            , className, disabled && "cursor-not-allowed bg-[#a1a9b5] ")
        }
    >
        {title}
    </Button>
  )
}
