'use client'
import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import ButtonTemplate from '../templates/button-template'

interface FAQItem {
    id: number
    question: string
    answer: string
}

const faqItems: FAQItem[] = [
    {
        id: 1,
        question: 'What is BIDNEX about?',
        answer: 'A bidding web app allows users to participate in auctions from anywhere, making it easy to place bids in real-time. It provides a platform for buyers and sellers to connect, ensuring a transparent and competitive bidding process. With features like notifications and bidding history, users can track their activities and make informed decisions.'
    },
    {
        id: 2,
        question: 'How do i get started',
        answer: 'To get started, simply create an account, verify your email, and you can begin browsing and bidding on items right away.'
    },
    {
        id: 3,
        question: 'How do i get started',
        answer: 'To get started, simply create an account, verify your email, and you can begin browsing and bidding on items right away.'
    },
    {
        id: 4,
        question: 'How do i get started',
        answer: 'To get started, simply create an account, verify your email, and you can begin browsing and bidding on items right away.'
    },
    {
        id: 5,
        question: 'How do i get started',
        answer: 'To get started, simply create an account, verify your email, and you can begin browsing and bidding on items right away.'
    }
]

export default function FAQs() {
    const [openId, setOpenId] = useState<number | null>(1) // First item is open by default

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id)
    }

    return (
        <div className="w-full ">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="flex-1 flex flex-col justify-between ">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Frequently Asked<br />Questions
                    </h2>
                    
                    {/* Still Have Questions Card */}
                    <div className="bg-[#252525] rounded-2xl p-8 flex flex-col  gap-4 w-max ">
                        <h3 className="text-white text-xl font-semibold">
                            Still Have Questions?
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Can't find an answer to your question? Send us an email and we'll<br/>get back to you as soon as possible
                        </p>
                        <div className="flex justify-start mt-2">
                            <ButtonTemplate 
                                title="Send Email" 
                                className="bg-white text-gray-900 hover:bg-white px-8 py-3 rounded-lg h-[40px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - FAQ Accordion */}
                <div className="flex-1 flex flex-col gap-4">
                    {faqItems.map((item) => {
                        const isOpen = openId === item.id
                        return (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-[16px] overflow-hidden transition-all duration-300 ease-in-out"
                            >
                                <button
                                    onClick={() => toggleFAQ(item.id)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="text-base font-medium text-gray-900 pr-4">
                                        {item.question}
                                    </span>
                                    <div className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        <ChevronDown className="w-8 h-8 p-2 text-gray-600 border border-[#F0F2F5] rounded-full shrink-0" />
                                    </div>
                                </button>
                                
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="px-6 pb-6">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
