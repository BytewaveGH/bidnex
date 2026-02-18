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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
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
       currentBid:100, 
        increment: 50
    },
]

export default function LiveAuctions() {


    return (
        <div className="flex flex-col items-center justify-center w-full  ">
            <div className="flex w-full items-end justify-between mb-8">
                <div className="flex flex-col items-start justify-center">
                    <h2 className="text-3xl font-bold mb-1.5">Live Auctions<br />Ending Soon</h2>
                    <div className="text-base font-normal text-[#657688]">Don't miss out on<br />these hot deals</div>
                </div>
                <div className="flex items-end justify-center gap-2">
                    <div className="flex items-end justify-center gap-2 underline text-sm font-normal hover:cursor-pointer ">See All</div>
                </div>
            </div>
            <div

                className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {mockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
