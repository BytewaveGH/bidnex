import React from 'react'
import Image from 'next/image'

export default function CategoryBanner({name,bannerImage}: {name: string, bannerImage: any}) {
  return (
    <section className="h-[360px] relative  w-full" >
    <Image src={bannerImage} alt="banner" className="w-full h-full object-cover" />
    <div
        className="absolute top-0 left-0 w-full h-full p-10 px-20"
        style={{
            background: 'linear-gradient(to bottom, #66666600, #2C2C2C91, #000000)',
        }}
    >
        <div className="flex flex-col items-start justify-end h-full">
            <p className="text-white text-4xl font-bold ">{name}</p>
        </div>
    </div>
</section>
  )
}
