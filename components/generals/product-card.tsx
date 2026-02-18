import { HeartIcon, AlarmClock, UsersRound } from 'lucide-react'
import React from 'react'
import ButtonTemplate from '../templates/button-template'
import Image from 'next/image'
import type { ProductCardType } from '@/lib/interfaces'
import InputTemplate from '../templates/input-template'
import { useRouter } from 'next/navigation'
import AlertDialogTemplate from '../templates/alert-dialog-template'

export default function ProductCard({ product, isLoggedIn }: { product: ProductCardType, isLoggedIn?: boolean }) {
    const router = useRouter()
    return (
        <div className="h-max border w-full rounded-[16px] border-[#F0F2F5] flex flex-col min-w-[400px] hover:cursor-pointer "
        
        onClick={() => router.push(`/product/${product.id}`)}
        >
            <div className="bg-[#F9FAFB] h-100 relative overflow-hidden rounded-t-[16px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image src={product.image} alt="iphone" className="w-full h-full object-cover rounded-t-[16px]" />
                </div>
                <div className="absolute top-4 right-0 z-10">
                    <div className={`w-fit px-2 py-2.5 rounded-l-[8px] text-white text-xs font-semibold ${product.condition === 'New/Like New' ? 'bg-[#099137]' :
                        product.condition === 'Good Condition' ? 'bg-[#003C71]' : 'bg-[#D42620]'}`}>
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
                        title={<HeartIcon className="w-5 h-5 text-[#2A3239]" />}
                        className="bg-white text-black hover:bg-white h-10 w-10 border border-[#F0F2F5] rounded-full p-0"
                    />
                </div>
            </div>
            <section className="p-4">
                <div className=" flex gap-4 mb-4 ">
                    <div className="text-xs font-medium flex items-center justify-center gap-2 bg-[#D42620] text-white rounded-[48px] px-4 py-2.5 border border-[#D42620]">
                        <AlarmClock className="w-4 h-4 " />
                        <span className="">{product.timeRemaining}</span>
                    </div>
                    <div className="text-xs font-medium flex items-center justify-center gap-2 text-black border border-[#D0D5DD] rounded-[48px] px-4 py-2.5">
                        <UsersRound className="w-4 h-4 " />
                        <span className="">{product.bidders} BIDDERS</span>
                    </div>

                </div>
                <div className="">
                    <h3 className="text-xl font-bold">{product.productName}</h3>
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