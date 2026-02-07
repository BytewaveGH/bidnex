import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export default function ButtonTemplate(
    { className, title, onClick }: { className?: string, title: React.ReactNode, onClick?: () => void }
) {
  return (
    <Button 
        onClick={onClick}
        className={
            cn("bg-black text-white rounded-[6px] text-sm font-semibold hover:bg-foreground hover:cursor-pointer"
            , className)
        }
    >
        {title}
    </Button>
  )
}
