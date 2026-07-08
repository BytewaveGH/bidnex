import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import Logo from '../templates/logo'

const FOOTER_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home / Kitchen',
    'Office Products',
    'Phones & Accessories',
    'Car Parts',
] as const

export default function Footer() {
    return (
        <footer className=" relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute -bottom-60 left-1/2 -translate-x-1/2 text-[400px] font-bold text-[#F7F9FC] select-none pointer-events-none ">
                BidChale
            </div>

            <div className="relative z-10 pb-80 py-16">
                {/* Top Section - Main Footer Content */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-12">
                    {/* Left Column - BidChale Information */}
                    <div className="flex-1">
                        <Logo className="text-2xl font-bold text-gray-900 mb-6" />
                        <div className="flex gap-6">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 ">Address</h3>
                                    <p className="text-sm text-[#515F6E]">Accra, Ghana</p>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-gray-900 ">Contact</h3>
                                    <a
                                            href="https://chat.whatsapp.com/K7YL6Dr5qFiGtRzFxkphAO?mode=gi_t"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors"
                                        >
                                            WhatsApp
                                        </a>
                                    <a
                                        href="mailto:BidChalehub@gmail.com"
                                        className="block text-sm text-[#515F6E] hover:text-gray-900 transition-colors"
                                    >
                                        BidChalehub@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 ">Categories</h3>
                                <ul className="">
                                    {FOOTER_CATEGORIES.map((category) => (
                                        <li key={category}>
                                            <Link
                                                href="/bidder/all-items"
                                                className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors"
                                            >
                                                {category}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 ">Resources</h3>
                                <ul className="">
                                    <li>
                                        <Link href="/blog" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Blog
                                        </Link>
                                    </li>
                                    {/* <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Help Center
                                        </a>
                                    </li> */}
                                   
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Categories */}


                    {/* Right Column - Resources */}

                </div>

                {/* Bottom Section - Social Media and Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200">
                    {/* Social Media Icons */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <a
                            href="#"
                            className="text-gray-900 hover:text-[#515F6E] transition-colors"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-900 hover:text-gray-600 transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-900 hover:text-gray-600 transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-900 hover:text-gray-600 transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-900 hover:text-gray-600 transition-colors"
                            aria-label="YouTube"
                        >
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-sm text-gray-600">
                        © Copyright {new Date().getFullYear()} BidChale
                    </div>
                </div>
            </div>
        </footer>
    )
}
