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
        question: 'What is BIDNEX?',
        answer: 'BIDNEX is an online bidding and auction platform built for Ghana. It connects buyers (bidders) and sellers (vendors) in a transparent, real-time marketplace where you can bid on products and services from anywhere in the country. Whether you\'re looking for electronics, vehicles, real estate, or everyday goods, BIDNEX makes the process fast, fair, and secure.'
    },
    {
        id: 2,
        question: 'How do I get started on BIDNEX?',
        answer: 'Getting started is simple. Sign up with your email or Google account, choose whether you\'re joining as a Bidder or a Vendor, verify your phone number, and you\'re ready to go. Bidders can immediately browse active auctions and place bids, while Vendors can list items for sale after completing a quick profile setup.'
    },
    {
        id: 3,
        question: 'What payment methods are accepted in Ghana?',
        answer: 'BIDNEX supports the most popular payment methods used in Ghana, including MTN Mobile Money (MoMo), Vodafone Cash, AirtelTigo Money, and major bank transfers. All transactions are processed in Ghana Cedis (GHS). We are continuously working to add more local payment options to make bidding as convenient as possible.'
    },
    {
        id: 4,
        question: 'What happens after I win a bid?',
        answer: 'Once you win a bid, you will receive a notification with payment and collection instructions. You are required to complete payment within the specified timeframe (usually 24–48 hours). After payment is confirmed, you can arrange pickup or delivery with the vendor. Failure to pay within the deadline may result in the item being offered to the next highest bidder.'
    },
    {
        id: 5,
        question: 'How do I list items as a Vendor?',
        answer: 'Register or log in as a Vendor, complete your profile, then navigate to your dashboard and click "List Item." Fill in the item details, set your starting bid price, auction duration, and upload clear photos. Once submitted, our team reviews your listing before it goes live. Vendors are responsible for ensuring listed items are accurate, available, and can be delivered or collected within Ghana.'
    },
    {
        id: 6,
        question: 'Is BIDNEX available across all regions in Ghana?',
        answer: 'Yes. BIDNEX is accessible from anywhere in Ghana with an internet connection — Accra, Kumasi, Tamale, Takoradi, and beyond. Delivery availability depends on the vendor. Some vendors offer nationwide delivery while others may specify pickup-only from a particular location, so always check the item details before bidding.'
    },
    {
        id: 7,
        question: 'How is my money protected if a deal goes wrong?',
        answer: 'BIDNEX holds payments in escrow until the buyer confirms receipt of the item. If a vendor fails to deliver or the item is significantly not as described, you can raise a dispute within 48 hours of the expected delivery date. Our support team will review the case and, where applicable, issue a refund. We strongly advise bidders to read item descriptions carefully and check vendor ratings before placing a bid.'
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
                    <div className="bg-[#252525] rounded-2xl p-8 flex flex-col gap-4 w-full">
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
