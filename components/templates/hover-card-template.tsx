import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

const defaultContent = (
  <>
    <div className="font-semibold">@nextjs</div>
    <div>The React Framework – created and maintained by @vercel.</div>
    <div className="text-muted-foreground mt-1 text-xs">
      Joined December 2021
    </div>
  </>
)

export default function HoverCardTemplate({
  trigger,
  content,
  contentClassName,
}: {
  trigger: React.ReactNode
  content?: React.ReactNode
  contentClassName?: string
}) {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild >
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent
      align='start'  
        className={cn('flex flex-col gap-0.5', contentClassName)}
      >
        {content ?? defaultContent}
      </HoverCardContent>
    </HoverCard>
  )
}
