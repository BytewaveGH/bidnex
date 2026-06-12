'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocket } from './websocket-provider'
import { showToast } from '@/components/templates/toast-template'
import { useAuctionSounds } from '@/hooks/use-auction-sounds'

export function BidNotificationsProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const { subscribe } = useWebSocket()
    const { playWinning, playOutbid } = useAuctionSounds()
    const currentUserId = Number((session?.user as any)?.userId)

    useEffect(() => {
        if (!currentUserId) return

        return subscribe((msg) => {
            if (msg.type !== 'auction_update') return
            const data = msg.data
            if (!data) return

            // Outbid — targeted event with data.type === 'outbid'
            if (data.type === 'outbid' && data.userId === currentUserId) {
                playOutbid()
                showToast('failure', data.lotTitle ?? 'Someone placed a higher bid.', "You've Been Outbid!")
                return
            }

            // Winning — generic bid update where current user is the bidder
            if (data.lotId !== undefined && data.currentBid !== undefined && data.bidderId === currentUserId) {
                playWinning()
                showToast('success', data.lotTitle ?? 'You placed the top bid!', "You're Winning!")
            }
        })
    }, [subscribe, currentUserId])

    return <>{children}</>
}
