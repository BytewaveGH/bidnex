'use client'
import { ArrowLeft, ArrowRight, Clock, Users, Heart, HeartIcon, AlarmClock, UsersRound } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import iphone from '@/assets/images/phone.png'
import monitor from '@/assets/images/monitor.png'
import headset from '@/assets/images/headset.png'
import { ProductCardType } from '@/lib/interfaces'
import ProductCard from '@/components/generals/product-card'

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

export default function AllItems() {
    return (<div className="w-full flex justify-center items-center">
        <div className="w-full px-4 flex justify-center items-center">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-2 justify-items-start w-full">
                {mockProducts.map((product) => (
                    <div key={product.id} className="w-full">
                        <ProductCard    isLoggedIn={true} product={product} />
                    </div>
                ))}
            </div>
        </div>
        </div>
    )
}