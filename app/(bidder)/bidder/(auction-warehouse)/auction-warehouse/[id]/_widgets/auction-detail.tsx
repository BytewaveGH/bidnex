'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MoveLeft, AlarmClock, MapPin, Package } from 'lucide-react'
import ButtonTemplate from '@/components/templates/button-template'
import { LotCardItem } from '@/components/generals/lot-card-item'
import { usePublicAuctionById } from '@/app/(bidder)/bidder/(all-items)/_logics/usePublicAuctionById'
import { useLotRealtime } from '@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime'
import { useResyncOnReconnect } from '@/components/generals/providers/websocket-provider'
import { computeTimeRemaining } from '@/app/(bidder)/bidder/(all-items)/_logics/auctions'

export default function AuctionDetail({ id }: { id: string }) {
    const router = useRouter()
    const { data: session } = useSession()
    const isLoggedIn = session?.user?.userType === 'bidder'

    const { data: auction, isLoading, error, refetch } = usePublicAuctionById(id)
    const baseLots = useMemo(() => auction?.lots ?? [], [auction])
    const realtimeLots = useLotRealtime(baseLots)
    useResyncOnReconnect(refetch)

    const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set())
    const handleExpired = useCallback((lotId: number) => {
        setExpiredIds(prev => new Set(prev).add(lotId))
    }, [])
    const visibleLots = useMemo(() => realtimeLots.filter(l => !expiredIds.has(l.id)), [realtimeLots, expiredIds])

    const isEnded = auction?.status === 'ended' || auction?.status === 'cancelled'

    return (
        <div className="page-container py-10">
            <div className="mb-6">
                <ButtonTemplate
                    title={<MoveLeft className="w-4 h-4" />}
                    className="bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer"
                    onClick={() => router.push('/bidder/auction-warehouse')}
                />
            </div>

            {isLoading && !auction && (
                <div className="w-full h-[120px] rounded-2xl bg-[#F0F2F5] animate-pulse mb-10" />
            )}

            {error && !auction && (
                <div className="w-full flex justify-center items-center py-20">
                    <p className="text-[#D42620] text-sm">{error}</p>
                </div>
            )}

            {auction && (
                <>
                    <div className="mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold">{auction.title}</h1>
                        <p className="text-sm text-[#657688] mt-2 max-w-2xl">{auction.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            {auction.locationName && (
                                <div className="text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span className="whitespace-nowrap">{auction.locationName}</span>
                                </div>
                            )}
                            <div className="text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5">
                                <Package className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap">{auction.lotCount} LOTS</span>
                            </div>
                            <div className="text-xs font-medium flex items-center gap-1.5 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5">
                                <AlarmClock className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap">
                                    {isEnded ? 'ENDED' : computeTimeRemaining(auction.endTime)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {visibleLots.length === 0 ? (
                        <div className="w-full flex justify-center items-center py-20">
                            <p className="text-[#657688] text-sm">No lots available in this auction right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
                            {visibleLots.map((lot) => (
                                <div key={lot.id} className="w-full">
                                    <LotCardItem lot={lot} isLoggedIn={isLoggedIn} onExpired={handleExpired} />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
