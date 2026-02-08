import React from 'react'
import ButtonTemplate from '../templates/button-template'
import Image from 'next/image'
import person from '@/assets/images/person.png'

export default function InfoCard() {
  return (
    <div className="w-full mx-auto relative">
          {/* Banner Container */}
          <div className="relative bg-[#1A1A1A] rounded-[24px] overflow-hidden flex flex-col lg:flex-row min-h-[300px]">
            {/* Decorative Circles - Background Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#D9D9D9] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute -top-20 left-100 w-32 h-32 bg-[#D9D9D9] rounded-full"></div>
            <div className="absolute bottom-0 -left-10 w-48 h-48 bg-[#D9D9D9] rounded-full -translate-x-1/2 translate-y-1/2"></div>
            {/* <div className="absolute top-0 right-0 w-56 h-56 bg-[#D9D9D9] rounded-full translate-x-1/4 -translate-y-1/4"></div> */}
            
            {/* Left Content Area */}
            <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center relative z-10">
              <h2 className="text-white text-5xl  font-semibold mb-6 leading-tight">
                Delivery Right To<br /> Your Doorstep
              </h2>
              <p className="text-white text-base font-normal mb-8 leading-relaxed opacity-90 max-w-lg">
                Experience the convenience of having your essentials brought directly to you, making life easier and more efficient.
              </p>
              <ButtonTemplate 
                title="Shop Now" 
                className="bg-white text-black hover:bg-white border border-black w-fit px-8 py-3 rounded-lg font-semibold"
              />
            </div>
          </div>
          
          {/* Right Image Area - Positioned absolutely to overlay on the banner */}
          <div className="absolute bottom-9 right-0 w-1/2 h-full z-20 overflow-visible">
            <div className="absolute bottom-0 right-0 w-full h-[110%] flex items-end justify-end">
              <div className="w-full h-full rounded-r-[24px] overflow-hidden flex justify-end">
                <Image src={person} alt="person" className="h-full w-auto object-contain" />
              </div>
            </div>
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400"></div>
          </div>
        </div>
  )
}
