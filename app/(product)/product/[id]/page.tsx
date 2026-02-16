'use client'
import TopNav from '@/components/generals/top-nav'
import ButtonTemplate from '@/components/templates/button-template'
import { AlarmClock, ChevronRight, MoveLeft } from 'lucide-react'
import Image from 'next/image'
import productImage from '@/assets/images/phone.png'
import React, { useState } from 'react'
import InputTemplate from '@/components/templates/input-template'
import AlertDialogTemplate from '@/components/templates/alert-dialog-template'
import favoriteIcon from '@/assets/svgs/eye.svg'
import { Separator } from '@/components/ui/separator'
import AccordionTemplate from '@/components/templates/accordion-template'
import RelatedItems from '@/components/generals/related-products'
import RelatedProducts from '@/components/generals/related-products'



const productGalleryImages = [productImage, productImage, productImage, productImage, productImage]

export default function ProductDetails() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  return (
    <section>
      <TopNav />
      <div className='px-20 py-10'>
        <div className='flex items-center gap-2 text-[13px]'>
          <ButtonTemplate
            title={<MoveLeft className={`w-4 h-4 `} />}
            className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer `}

          /> <span className='text-[#515F6E]'>Category</span> <ChevronRight className='w-4 h-4' />  <span className='font-semibold'>Product name</span>
        </div>
        <div className='py-10 flex  justify-center gap-20'>
          <div className='flex flex-col gap-4'>
            <div className="bg-[#F9FAFB] h-[588px] relative overflow-hidden rounded-[16px] w-[535px]">
              <div className="absolute inset-0 flex items-center justify-center ">
                <Image src={productGalleryImages[selectedImageIndex]} alt="iphone" className="w-full h-full object-cover rounded-[16px]" />
              </div>
              <div className="absolute bottom-4 right-4 z-10" >
                <div className="text-xs font-medium flex items-center justify-center gap-2 bg-[#E5E5EA] text-black rounded-[48px] px-4 py-2.5 ">
                  <AlarmClock className="w-4 h-4 " />
                  <span className="">0 DAYS 2:20:11</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {productGalleryImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-[83px] h-[83px] rounded-[8px] overflow-hidden bg-[#F9FAFB] flex items-center justify-center shrink-0 transition-shadow focus:outline-none  ${selectedImageIndex === index ? 'border-black border ring-black' : ''}`}
                >
                  <Image src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <h1 className='text-5xl font-bold'>Apple Iphone 16 Pro Max</h1>
            <div className='flex items-center gap-2'>
              <div className={`w-fit px-2 py-2.5 rounded-[8px] text-white text-xs font-semibold bg-[#099137]`}>
                New/Like New
              </div>
              <div className='bg-[#E4E7EC] w-fit px-2 py-2.5 rounded-[8px] text-black text-xs font-semibold'>
                1 qty
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className="">
                <p className="text-sm font-medium ">
                  CURRENT BID:  <span className='font-semibold text-lg'>GHS 100.00</span></p>
              </div>
              <div className="">
                <p className="text-sm  text-[#657688]  ">MKT PR: <span className=' text-lg font-semibold '>GHS 1000.00</span></p>
              </div>
            </div>
            <ButtonTemplate title={`Bid GHS 100.00`} className="bg-black text-white hover:bg-black  w-[656px] h-[48px] mt-4" />
            <div className='flex items-center my-2 gap-4 '>
              <div className='flex-1 min-w-0'>
                <InputTemplate placeholder={'GHS0.00'} className='h-11 shadow-none w-full' inputAlign="center" />
              </div>
              <div className='flex-1 min-w-0'>
                <AlertDialogTemplate trigger={<ButtonTemplate title="Set Max Bid" className="bg-[#FFCC00] text-black hover:bg-[#FFCC00] h-11 w-full" />} />
              </div>
            </div>
            <ButtonTemplate title={
              <div className='flex items-center gap-2'>
                <Image src={favoriteIcon} alt="favorite" className='size-5' />
                <span className='text-sm font-medium '>Add To Watchlist</span>
              </div>
            } className="bg-white text-black hover:bg-white border  w-[656px] h-[48px] " />
            <div >
              <Separator className='h-1' />
              <AccordionTemplate
                className="w-[656px]"
                items={[
                  {
                    value: "details",
                    trigger: "Details",
                    content: "The Apple Watch Series 5 keeps you active, healthy, and in touch. From fitness tracking to heart-rate monitoring and smart notifications, it's built to simplify your life. The 40mm size ensures a comfortable fit while still giving you a bright, easy-to-read display.",
                  },
                  {
                    value: "specification",
                    trigger: "Specification",
                    content: (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Brand: Apple</li>
                        <li>Screen Size: 11 inches</li>
                        <li>Storage: 128 gigabytes</li>
                        <li>Battery Health: 98%</li>
                      </ul>
                    ),
                  },
                  {
                    value: "delivery-info",
                    trigger: "Delivery Info",
                    content: "The Apple Watch Series 5 keeps you active, healthy, and in touch. From fitness tracking to heart-rate monitoring and smart notifications, it's built to simplify your life. The 40mm size ensures a comfortable fit while still giving you a bright, easy-to-read display.",
                  },
                ]} />
            </div>
          </div>
        </div>
        <div>
          <RelatedProducts />
        </div>
      </div>

    </section>
  )
}
