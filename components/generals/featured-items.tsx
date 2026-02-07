'use client'
import { ArrowLeft, ArrowRight, Clock, Users, Heart, HeartIcon, AlarmClock, UsersRound } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import ButtonTemplate from '../templates/button-template'
import iphone from '@/assets/images/phone.png'
import monitor from '@/assets/images/monitor.png'
import headset from '@/assets/images/headset.png'
import ProductCard from './product-card'
import { ProductCardType } from '@/lib/interfaces'

const mockProducts: ProductCardType[] = [
    {
        id: 1,
        image: iphone,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 2,
        image: monitor,
        condition: 'Good Condition',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 3,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 4,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 5,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 6,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 7,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
    {
        id: 8,
        image: headset,
        condition: 'New/Like New',
        quantity: 1,
        timeRemaining: '0 DAYS 2:20:11',
        bidders: 12,
        productName: 'Apple Iphone 16 Pro Max',
        marketPrice: 'GHS 267.00',
        currentBid: 'GHS 100.00'
    },
]

export default function FeaturedItems() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollAvailability = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }

    useEffect(() => {
        const container = scrollContainerRef.current
        if (container) {
            // Initial check
            checkScrollAvailability()
            
            // Check after content loads
            setTimeout(checkScrollAvailability, 100)
            
            // Listen to scroll events
            container.addEventListener('scroll', checkScrollAvailability)
            window.addEventListener('resize', checkScrollAvailability)
            
            return () => {
                container.removeEventListener('scroll', checkScrollAvailability)
                window.removeEventListener('resize', checkScrollAvailability)
            }
        }
    }, [mockProducts])

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -400,
                behavior: 'smooth'
            })
            // Check after scroll animation completes
            setTimeout(checkScrollAvailability, 500)
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 400,
                behavior: 'smooth'
            })
            // Check after scroll animation completes
            setTimeout(checkScrollAvailability, 500)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full ">
            <div className="flex w-full items-start justify-between mb-8">
                <h2 className="text-3xl font-bold">Featured Items</h2>
                <div className="flex items-center justify-center gap-2">
                    <ButtonTemplate
                        title={<ArrowLeft className={`w-4 h-4 ${canScrollLeft ? 'text-[#2A3239]' : 'text-[#98A2B3]'}`} />}
                        className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollLeft ? 'border-[#2A3239]' : 'border-[#98A2B3]'}`}
                        onClick={scrollLeft}
                    />
                    <ButtonTemplate
                        title={<ArrowRight className={`w-4 h-4 ${canScrollRight ? 'text-[#2A3239]' : 'text-[#98A2B3]'}`} />}
                        className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollRight ? 'border-[#2A3239]' : 'border-[#98A2B3]'}`}
                        onClick={scrollRight}
                    />
                </div>
            </div>
            <div 
                ref={scrollContainerRef}
                className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {mockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
