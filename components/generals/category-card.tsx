import React from 'react'
import Image from 'next/image'
import type { CategoryType } from '@/lib/interfaces'

export default function CategoryCard({ category }: { category: CategoryType }) {
    return (
        <div className="bg-[#F7F9FC] rounded-2xl p-4 sm:p-6 flex flex-col relative overflow-hidden h-[300px] sm:h-[360px]">
            <div className="flex-1 flex flex-col justify-start z-10 relative">
                <div className="text-lg sm:text-xl font-semibold text-[#2A3239] mb-2">
                    {category.name}
                </div>
                <div className="text-xs sm:text-sm font-normal text-[#657688] leading-relaxed max-w-[75%] sm:max-w-[60%]"> {category.description} </div>
            </div>

            <div className={`absolute bottom-0 w-full h-full flex items-end justify-end z-0 ${category.name === 'Electronics' ? '-right-8 sm:-right-15' : '-right-3 sm:-right-7'}`}>
                <div className="w-full h-[190px] sm:h-[250px] flex items-end justify-end overflow-hidden rounded-br-2xl">
                    <Image
                        src={category.image}
                        alt={category.name as string}
                        className="w-full h-full object-contain object-bottom-right"
                    />
                </div>
            </div>
        </div>
    )
}