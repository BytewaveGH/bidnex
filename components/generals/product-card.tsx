import { AlarmClock, UsersRound, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import ButtonTemplate from '../templates/button-template'
import Image from 'next/image'
import eyeIcon from '@/assets/svgs/eye.svg'
import type { ProductCardType } from '@/lib/interfaces'
import InputTemplate from '../templates/input-template'
import { useRouter } from 'next/navigation'
import AlertDialogTemplate from '../templates/alert-dialog-template'

function CardCountdown({ endTime, fallback }: { endTime: string; fallback: string }) {
    const [label, setLabel] = useState(fallback)

    useEffect(() => {
        function tick() {
            const diff = new Date(endTime).getTime() - Date.now()
            if (diff <= 0) { setLabel('ENDED'); return }
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

export default function ProductCard({ product, isLoggedIn, isInWatchlist, onWatchlistToggle, isWatchlistLoading }: { product: ProductCardType, isLoggedIn?: boolean, isInWatchlist?: boolean, onWatchlistToggle?: () => void, isWatchlistLoading?: boolean }) {
    const router = useRouter()
    const [imgError, setImgError] = useState(false)
    return (
        <div className="h-max border w-full rounded-[16px] border-[#F0F2F5] flex flex-col hover:cursor-pointer "
        
        onClick={() => router.push(`/bidder/product/${product.id}`)}
        >
            <div className="bg-[#F9FAFB] h-100 relative overflow-hidden rounded-t-[16px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    {product.image && !imgError ? (
                        <Image src={product.image} alt={product.productName} fill className="object-cover rounded-t-[16px]" onError={() => setImgError(true)} />
                    ) : (
                        <div className="w-full h-full bg-[#f1f1f1] flex items-center justify-center">
                            <span className="text-[#98A2B3] text-sm">No image</span>
                        </div>
                    )}
                </div>
                <hr/>
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
            </div>
            <section className="p-4 border-t border-gray-100">
                <div className=" flex gap-4 mb-4 ">
                    <div className="text-xs font-medium flex items-center justify-center gap-2 bg-[#D42620] text-white rounded-[48px] px-4 py-2.5 border border-[#D42620]">
                        <AlarmClock className="w-4 h-4 " />
                        {product.bidEndTime
                            ? <CardCountdown endTime={product.bidEndTime} fallback={product.timeRemaining} />
                            : <span>{product.timeRemaining}</span>
                        }
                    </div>
                    <div className="text-xs font-medium flex items-center justify-center gap-2 text-black border border-[#D0D5DD] rounded-[48px] px-4 py-2.5">
                        <UsersRound className="w-4 h-4 " />
                        <span className="">{product.bidders} BIDDERS</span>
                    </div>

                </div>
                <div className="">
                    <h3 className="text-xl font-bold line-clamp-1">{product.productName}</h3>
                </div>
                <div className="">
                    <p className="text-base font-light text-[#657688] mt-2 ">MKT PR: {product.marketPrice}</p>
                </div>
                <div className="">
                    <p className="text-lg font-medium ">CURRENT BID: GHS {product.currentBid.toFixed(2)}</p>
                </div>
                {!isLoggedIn && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ButtonTemplate title="Login To Bid" className="bg-black text-white hover:bg-black w-full h-[48px] mt-4" />
                    </div>
                )}
                {isLoggedIn &&
                    <div onClick={(e) => e.stopPropagation()}>
                        <ButtonTemplate title={`Bid GHS ${(product.currentBid + product.increment).toFixed(2)}  `} className="bg-black text-white hover:bg-black w-full h-[48px] mt-4" />
                        <div className='flex items-center my-2 gap-4 '>
                            <div className='flex-1 min-w-0'>
                                <InputTemplate placeholder={'GHS0.00'} className='h-11 shadow-none w-full' inputAlign="center" />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <AlertDialogTemplate trigger={<ButtonTemplate title="Set Max Bid" className="bg-[#FFCC00] text-black hover:bg-[#FFCC00] h-11 w-full" />} />
                            </div>
                        </div>
                    </div>
                }
            </section>

        </div>
    )
}