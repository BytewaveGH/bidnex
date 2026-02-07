import React from 'react'

export default function HowItWorks() {
  return (
    <div>
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="text-white text-3xl font-semibold mb-2">How It Works</h2>
          <p className="text-white text-base font-normal">Simple, transparent, and secure bidding process</p>
        </div>
        <div className="relative max-w-6xl mx-auto">
          {/* Horizontal connecting line */}
          <div className="absolute top-8 left-40 right-40 h-0.5 bg-gray-300"></div>
          
          <div className="flex items-start justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-900">1</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Create An Account</h3>
                <p className="text-[#96A4B1] text-sm leading-relaxed">Sign up for free and verify your<br/>account to start bidding</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-900">2</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Browse And Bid</h3>
                <p className="text-[#96A4B1] text-sm leading-relaxed">Explore thousands of items and<br/>place your bids</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-900">3</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Win Auction</h3>
                <p className="text-[#96A4B1] text-sm leading-relaxed">Be the highest bidder when the<br/>timer runs out</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-900">4</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Pay & Receive</h3>
                <p className="text-[#96A4B1] text-sm leading-relaxed">Complete payment and get your<br/>item delivered</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}