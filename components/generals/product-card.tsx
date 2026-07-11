import { AlarmClock, UsersRound, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import ButtonTemplate from '../templates/button-template'
import Image from 'next/image'
import eyeIcon from '@/assets/svgs/eye.svg'
import type { ProductCardType } from '@/lib/interfaces'
import InputTemplate from '../templates/input-template'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog'
import { LotImage } from './lot-image'

function CardCountdown({ endTime, fallback, onExpired }: { endTime: string; fallback: string; onExpired?: () => void }) {
    const [label, setLabel] = useState(fallback)
    const firedRef = useRef(false)
    const onExpiredRef = useRef(onExpired)
    onExpiredRef.current = onExpired

    useEffect(() => {
        firedRef.current = false
        function tick() {
            const diff = new Date(endTime).getTime() - Date.now()
            if (diff <= 0) {
                setLabel('ENDED')
                if (!firedRef.current) {
                    firedRef.current = true
                    onExpiredRef.current?.()
                }
                return
            }
            const days = Math.floor(diff / 86400000)
            const hours = Math.floor((diff % 86400000) / 3600000)
            const mins = Math.floor((diff % 3600000) / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setLabel(`${days} DAYS ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [endTime])

    return <span className="tabular-nums whitespace-nowrap">{label}</span>
}

type ProductCardProps = {
    product: ProductCardType
    isLoggedIn?: boolean
    isInWatchlist?: boolean
    onWatchlistToggle?: () => void
    isWatchlistLoading?: boolean
    isWon?: boolean
    // real-time bid props
    isWinning?: boolean
    isOutbid?: boolean
    isClosed?: boolean
    isBidding?: boolean
    bidError?: string | null
    suggestedBid?: number
    antiSniped?: boolean
    onBid?: (amount: number) => Promise<boolean>
    onClearBidError?: () => void
    isSettingMaxBid?: boolean
    maxBidError?: string | null
    onSetMaxBid?: (amount: number) => Promise<boolean>
    onClearMaxBidError?: () => void
    isBuyingNow?: boolean
    onBuyNow?: () => Promise<boolean>
    onExpired?: () => void
}

export default function ProductCard({
    product,
    isLoggedIn,
    isInWatchlist,
    onWatchlistToggle,
    isWatchlistLoading,
    isWon,
    isWinning,
    isOutbid,
    isClosed,
    isBidding,
    bidError,
    suggestedBid,
    antiSniped,
    onBid,
    onClearBidError,
    isSettingMaxBid,
    maxBidError,
    onSetMaxBid,
    onClearMaxBidError,
    isBuyingNow,
    onBuyNow,
    onExpired,
}: ProductCardProps) {
    const router = useRouter()
    const [timeEnded, setTimeEnded] = useState(false)
    const [maxBidInput, setMaxBidInput] = useState('')
    const [confirmMaxBidOpen, setConfirmMaxBidOpen] = useState(false)
    const [confirmBuyNowOpen, setConfirmBuyNowOpen] = useState(false)
    const handleExpired = useCallback(() => {
        setTimeEnded(true)
        onExpired?.()
    }, [onExpired])
    const effectiveSuggestedBid = suggestedBid ?? (product.currentBid + (product.increment > 0 ? product.increment : 1))
    const imageSrc =
        typeof product.image === 'string'
            ? product.image
            : product.image?.src ?? ''
    const parsedMaxBid = Number(maxBidInput)
    const isMaxBidValid = maxBidInput.trim() !== '' && Number.isFinite(parsedMaxBid) && parsedMaxBid >= effectiveSuggestedBid

    async function handleBid() {
        if (!onBid) return
        await onBid(effectiveSuggestedBid)
    }

    async function handleConfirmMaxBid() {
        if (!onSetMaxBid) return
        setConfirmMaxBidOpen(false)
        const success = await onSetMaxBid(parsedMaxBid)
        if (success) setMaxBidInput('')
    }

    async function handleConfirmBuyNow() {
        if (!onBuyNow) return
        setConfirmBuyNowOpen(false)
        await onBuyNow()
    }

    return (
        <div className={`h-max border w-full rounded-[16px] flex flex-col ${isClosed ? 'opacity-60' : ''} ${isWon ? 'border-2 border-[#099137]' : isWinning ? 'border-2 border-[#099137]' : isOutbid ? 'border-2 border-[#F3A218]' : isClosed ? 'border-2 border-[#D96B6B]' : 'border border-[#F0F2F5]'}`}
        >
            <div className="bg-[#F9FAFB] h-[240px] sm:h-[340px] relative overflow-hidden rounded-t-[16px] hover:cursor-pointer"
                onClick={() => router.push(`/bidder/product/${product.id}`)}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <LotImage
                        src={imageSrc}
                        alt={product.productName}
                        className="object-cover rounded-t-[16px]"
                        sizes="340px"
                    />
                </div>
                <hr />
                <div className="absolute top-4 right-0 z-10 ">
                    <div className={`w-fit px-2 py-2.5 rounded-l-[8px] text-white text-xs font-semibold ${product.condition === 'New/Like New' ? 'bg-[#099137]' :
                        product.condition === 'Good Condition' ? 'bg-[#003C71]' :
                            product.condition === 'New' || product.condition === "Like New" ?
                                'bg-[#099137]' :
                                'bg-[#8E8E93]'}`}>
                        {product.condition}
                    </div>
                </div>

                <div className="absolute bottom-4 left-0 z-10">
                    <div className='bg-[#E4E7EC] w-fit px-2 py-2.5 rounded-r-[8px] text-black text-xs font-semibold'>
                        {product.quantity} qty
                    </div>
                </div>

                {!isWon && isLoggedIn && (
                    <div className="absolute bottom-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                        <ButtonTemplate
                            title={
                                isWatchlistLoading
                                    ? <Loader2 className="w-4 h-4 animate-spin text-[#344054]" />
                                    : <Image
                                        src={eyeIcon}
                                        alt="watchlist"
                                        className="w-5 h-5"
                                        style={isInWatchlist ? { filter: 'brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(1475%) hue-rotate(1deg) brightness(110%)' } : undefined}
                                    />
                            }
                            className="bg-white text-black hover:bg-white h-10 w-10 border border-[#F0F2F5] rounded-full p-0"
                            onClick={onWatchlistToggle}
                            disabled={isWatchlistLoading}
                        />
                    </div>
                )}

                {/* Anti-snipe flash */}
                {antiSniped && (
                    <div className="absolute top-4 left-4 z-10 bg-[#FFCC00] text-black text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                        +3mins
                    </div>
                )}

                {/* Winning ribbon */}
                {isWinning && (
                    <div className="absolute top-0 -left-4 overflow-hidden w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute bg-[#099137] text-white text-[12px] font-bold py-1.5 w-44 text-center -rotate-45 top-7 -left-7 tracking-wide whitespace-nowrap">
                            WINNING • WINNING • WINNING •
                        </div>
                    </div>
                )}

                {/* Outbid ribbon */}
                {isOutbid && (
                    <div className="absolute top-0 -left-4 overflow-hidden w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute bg-[#F3A218] text-white text-[12px] font-bold py-1.5 w-44 text-center -rotate-45 top-7 -left-7 tracking-wide whitespace-nowrap">
                            OUTBID • OUTBID • OUTBID •
                        </div>
                    </div>
                )}

                {/* Sold ribbon + grey overlay */}
                {isClosed && (
                    <div className="absolute top-0 -left-4 overflow-hidden w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute bg-[#D96B6B] text-white text-[12px] font-bold py-1.5 w-44 text-center -rotate-45 top-7 -left-7 tracking-wide whitespace-nowrap">
                            SOLD • SOLD • SOLD • SOLD •
                        </div>
                    </div>
                )}

                {/* Won ribbon */}
                {isWon && (
                    <div className="absolute top-0 -left-4 overflow-hidden w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute bg-[#099137] text-white text-[12px] font-bold py-1.5 w-44 text-center -rotate-45 top-7 -left-7 tracking-wide whitespace-nowrap">
                            WON • WON • WON • WON •
                        </div>
                    </div>
                )}
            </div>

            <section className="p-3 border-t border-gray-100">
                <div className="flex gap-2 mb-3 min-w-0 flex-wrap">
                    <div className="text-xs font-medium flex items-center gap-2 bg-[#D42620] text-white rounded-[48px] px-3 py-1.5 border border-[#D42620] shrink-0">
                        <AlarmClock className="w-3.5 h-3.5 shrink-0" />
                        {product.bidEndTime
                            ? <CardCountdown endTime={product.bidEndTime} fallback={product.timeRemaining} onExpired={handleExpired} />
                            : <span className="whitespace-nowrap">{product.timeRemaining}</span>
                        }
                    </div>
                    <div className="text-xs font-medium flex items-center gap-2 text-black border border-[#D0D5DD] rounded-[48px] px-3 py-1.5 min-w-0 overflow-hidden">
                        <UsersRound className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate whitespace-nowrap">{product.bidders} BIDS</span>
                    </div>
                </div>

                <h3 className="text-base font-bold line-clamp-1">{product.productName}</h3>
                <p className="text-xs font-light text-[#657688] mt-1">MKT PR: {product.marketPrice}</p>
                <p className="text-sm font-medium mt-1">CURRENT BID: GHS {product.currentBid.toFixed(2)}</p>

                {!isWon && !isLoggedIn && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ButtonTemplate
                            title="Login to Bid"
                            className="bg-black text-white hover:bg-black w-full h-10 mt-3"
                            onClick={() => router.push('/auth/login')}
                        />
                    </div>
                )}

                {!isWon && isLoggedIn && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-10 mt-3 rounded-[6px] overflow-hidden">
                            <button
                                type="button"
                                onClick={handleBid}
                                disabled={isBidding || isClosed || isWinning || timeEnded}
                                className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                                style={{
                                    width: product.buyNowPrice ? '72%' : '100%',
                                    backgroundColor: isWinning ? '#099137' : '#000',
                                    clipPath: product.buyNowPrice ? 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' : undefined,
                                }}
                            >
                                {isBidding
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : `Bid GHS ${effectiveSuggestedBid.toFixed(2)}`}
                            </button>

                            {!!product.buyNowPrice && (
                                <button
                                    type="button"
                                    onClick={() => setConfirmBuyNowOpen(true)}
                                    disabled={isBuyingNow || isClosed || timeEnded}
                                    className="absolute inset-y-0 right-0 flex flex-col items-center justify-center bg-[#003C71] text-white text-[10px] leading-tight font-semibold hover:brightness-110 transition-[filter] px-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                                    style={{ width: 'calc(28% + 14px)', clipPath: 'polygon(16px 0, 100% 0, 100% 100%, 0 100%)' }}
                                >
                                    {isBuyingNow ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Buy Now</span>
                                            <span>GHS {product.buyNowPrice.toFixed(2)}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {bidError && (
                            <p
                                className="text-[#D42620] text-xs mt-1 cursor-pointer capitalize"
                                onClick={(e) => { e.stopPropagation(); onClearBidError?.() }}
                            >
                                {bidError}
                            </p>
                        )}

                        {maxBidError && (
                            <p
                                className="text-[#D42620] text-xs mt-1 cursor-pointer capitalize"
                                onClick={(e) => { e.stopPropagation(); onClearMaxBidError?.() }}
                            >
                                {maxBidError}
                            </p>
                        )}

                        <div className='flex items-center mt-2 gap-2'>
                            <div className='flex-1 min-w-0'>
                                <InputTemplate
                                    placeholder={'GHS0.00'}
                                    className='h-9 shadow-none w-full'
                                    inputAlign="center"
                                    type="number"
                                    value={maxBidInput}
                                    onChange={(e) => setMaxBidInput(e.target.value)}
                                />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <ButtonTemplate
                                    title={isSettingMaxBid ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Set Max Bid"}
                                    className="bg-[#FFCC00] text-black hover:bg-[#FFCC00] h-9 w-full"
                                    disabled={!isMaxBidValid || isSettingMaxBid || isClosed || timeEnded}
                                    onClick={() => setConfirmMaxBidOpen(true)}
                                />
                            </div>
                        </div>

                        <AlertDialog open={confirmMaxBidOpen} onOpenChange={setConfirmMaxBidOpen}>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Set max bid?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        We&apos;ll automatically bid on your behalf up to{' '}
                                        <span className="font-medium text-foreground">
                                            GHS {Number.isFinite(parsedMaxBid) ? parsedMaxBid.toFixed(2) : '0.00'}
                                        </span>{' '}
                                        as others bid on this item.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConfirmMaxBid}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={confirmBuyNowOpen} onOpenChange={setConfirmBuyNowOpen}>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Buy this item now?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You&apos;ll purchase <span className="font-medium text-foreground">{product.productName}</span> immediately for{' '}
                                        <span className="font-medium text-foreground">GHS {(product.buyNowPrice ?? 0).toFixed(2)}</span>, ending the auction.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConfirmBuyNow}>Buy Now</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </section>
        </div>
    )
}
