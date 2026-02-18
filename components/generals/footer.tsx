import React from 'react'
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import Logo from '../templates/logo'

export default function Footer() {
    return (
        <footer className=" relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute -bottom-60 left-1/2 -translate-x-1/2 text-[400px] font-bold text-[#F7F9FC] select-none pointer-events-none ">
                BIDNEX
            </div>

            <div className="relative z-10 pb-80 py-16">
                {/* Top Section - Main Footer Content */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-12">
                    {/* Left Column - BIDNEX Information */}
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
                                    <p className="text-sm text-[#515F6E] mb-1">+233244300000</p>
                                    <p className="text-sm text-[#515F6E]">bidnex@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 ">Categories</h3>
                                <ul className="">
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Appliances
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Electronics
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Phone Accessories
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Car Parts
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 ">Resources</h3>
                                <ul className="">
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-[#515F6E] hover:text-gray-900 transition-colors">
                                            Contact
                                        </a>
                                    </li>
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
                        © Copyright 2026 BIDNEX
                    </div>
                </div>
            </div>
        </footer>
    )
}
