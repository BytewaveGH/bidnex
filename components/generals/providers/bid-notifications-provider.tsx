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
            // Private notifications — delivered as user_event on the live server
            if (msg.type === 'user_event') {
                const data = msg.data
                if (!data) return

                if (data.type === 'outbid' || msg.event === 'bidder_outbid') {
                    playOutbid()
                    showToast('failure', data.message ?? data.lotTitle ?? 'Someone placed a higher bid.', "You've Been Outbid!")
                    return
                }

                // New symmetric counterpart to outbid — private, room-independent "you're
                // now winning" notification. Backend doesn't send this yet (see
                // docs/backend-websocket-bidding-protocol.md); inert until it does, but once
                // it ships this fires regardless of whether this tab ever joined the auction's
                // room, unlike the public auction_update fallback below.
                if (data.type === 'winning' || msg.event === 'bidder_winning') {
                    playWinning()
                    showToast('success', data.message ?? data.lotTitle ?? 'You placed the top bid!', "You're Winning!")
                    return
                }

                if (data.type === 'auction_won') {
                    playWinning()
                    showToast('success', data.message ?? data.lotTitle ?? 'You won the auction!', 'Auction Won!')
                }
                return
            }

            if (msg.type !== 'auction_update') return
            const data = msg.data
            if (!data) return

            // Outbid — legacy shape seen on the public channel, kept for compatibility
            if (data.type === 'outbid' && data.userId === currentUserId) {
                playOutbid()
                showToast('failure', data.lotTitle ?? 'Someone placed a higher bid.', "You've Been Outbid!")
                return
            }

            // Winning — generic bid update where current user is the bidder
            if (data.lotId !== undefined && data.currentBid !== undefined) {
                const winnerId = data.winnerId ?? data.bidderId
                if (winnerId === currentUserId) {
                    playWinning()
                    showToast('success', data.lotTitle ?? 'You placed the top bid!', "You're Winning!")
                }
            }
        })
    }, [subscribe, currentUserId])

    return <>{children}</>
}
