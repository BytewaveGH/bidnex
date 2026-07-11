'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { LotCardItem } from '@/components/generals/lot-card-item'
import { usePublicFeaturedLots } from '@/app/(bidder)/bidder/(all-items)/_logics/usePublicFeaturedLots'
import { useLotRealtime } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'
import { useResyncOnReconnect } from '@/components/generals/providers/websocket-provider'

type PopularProps = {
    search?: string
}

export default function Popular({ search }: PopularProps) {
    const { data: session } = useSession()
    const isLoggedIn = session?.user?.userType === 'bidder'
    const { data, isLoading, error, refetch } = usePublicFeaturedLots()
    const baseLots = useMemo(() => data?.data ?? [], [data])
    const realtimeLots = useLotRealtime(baseLots)
    useResyncOnReconnect(refetch)

    const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set())
    const handleExpired = useCallback((id: number) => {
        setExpiredIds(prev => new Set(prev).add(id))
    }, [])
    // The featured-lots endpoint has no search param, so filter the (already
    // fully-loaded) list client-side instead of round-tripping to the API.
    const visibleLots = useMemo(() => {
        const notExpired = realtimeLots.filter(l => !expiredIds.has(l.id))
        if (!search) return notExpired
        const q = search.toLowerCase()
        return notExpired.filter(l => l.title.toLowerCase().includes(q))
    }, [realtimeLots, expiredIds, search])

    if (isLoading && !data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[380px] sm:h-[480px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#D42620] text-sm">{error}</p>
            </div>
        )
    }

    if (visibleLots.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <p className="text-[#657688] text-sm">
                    {search ? 'No items match your search.' : 'No items available right now.'}
                </p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                {visibleLots.map((lot) => (
                    <div key={lot.id} className="w-full">
                        <LotCardItem lot={lot} isLoggedIn={isLoggedIn} onExpired={handleExpired} />
                    </div>
                ))}
            </div>
        </div>
    )
}
