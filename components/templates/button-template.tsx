import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export default function ButtonTemplate(
    { className, title, onClick, disabled = false, type = "button" }: { className?: string, title: React.ReactNode, onClick?: () => void, disabled?: boolean, type?: "button" | "submit" | "reset" }
) {
  return (
    <Button 
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={
            cn("bg-black text-white rounded-[6px] border-[#E4E7EC] text-sm font-semibold hover:bg-foreground hover:cursor-pointer"
            , className, disabled && "cursor-not-allowed bg-[#a1a9b5] ")
        }
    >
        {title}
    </Button>
  )
}
