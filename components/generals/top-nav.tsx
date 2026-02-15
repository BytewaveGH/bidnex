'use client'
import React, { useEffect, useState } from 'react'
import ButtonTemplate from '../templates/button-template'
import InputTemplate from '../templates/input-template'
import Logo from '../templates/logo'
import { useRouter } from 'next/navigation'
import { Armchair, Car, CarFront, CookingPot, Monitor, MonitorSmartphone, SearchIcon, Shirt, Smartphone, UtensilsCrossed } from 'lucide-react'
import legalHammer from '@/assets/svgs/legal-hammer.svg'
import champion from '@/assets/svgs/champion.svg'
import favoriteIcon from '@/assets/svgs/eye.svg'
import profileIcon from '@/assets/svgs/profile.jpg'
import headset from '@/assets/images/headset.png'
import Image from 'next/image'
import HoverCardTemplate from '@/components/templates/hover-card-template'
import electronics from '@/assets/images/electronics.png'
import clothing from '@/assets/images/clothing.png'
import car from '@/assets/images/car.png'
import office from '@/assets/images/office.png'
import phoneAccessories from '@/assets/images/phone-accessories.png'
import utensils from '@/assets/images/utensils.png'


const categoriesHoverItems = [
  { icon: MonitorSmartphone, title: 'Electronics', description: 'Find monitors, tvs, headsets, etc', image: electronics },
  { icon: Armchair, title: 'Office Products', description: 'Find office chairs, lamps, desks, etc', image: office },
  { icon: Shirt, title: 'Clothing', description: 'Find shirts, sneakers, dresses, etc', image: clothing },
  { icon: Smartphone, title: 'Phones & Accessories', description: 'Find phones, cases, Chargers, etc', image: phoneAccessories },
  { icon: CookingPot, title: 'Home/Kitchen', description: 'Find air fryer, duvet, utensils, etc', image: utensils },
  { icon: CarFront, title: 'Car Parts', description: 'Find shaft, brake pads, jumper etc', image: car },
] as const


export default function TopNav() {
  const router = useRouter()
  const [navItems, setNavItems] = useState<{ name: string, path: string }[]>([{ name: 'All Items', path: '/all-items' }, { name: 'Categories', path: '/categories' }, { name: 'Buy Now', path: '/buy-now' }, { name: 'Popular', path: '/popular' }])
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(0)
  const svgsIcons = [legalHammer, favoriteIcon, champion]
  useEffect(() => {
    const signedIn = localStorage.getItem('isSignedIn')
    if (signedIn) {
      setIsSignedIn(true)
    }
  }, [])
  return (
    <div className="sticky top-0 z-50 bg-white">
      <section className=" py-4 flex px-20 justify-between items-center h-full w-full gap-4 min-w-0">
        <Logo />
        <div className="flex-1 min-w-0 max-w-[600px] h-[40px] shadow-none rounded-[100px]">
          <InputTemplate
            icon={<SearchIcon />}
            placeholder="Search for anything"
            className="flex-1 min-w-0 max-w-[600px] h-[40px] shadow-none rounded-[100px]"
          />
        </div>
        {isSignedIn ?
          <div className='flex gap-5 shrink-0 items-center'>
            {svgsIcons.map((svg, index) => (
              <div key={index} className='relative flex items-center justify-center border rounded-full p-2'>
                <Image src={svg} alt="svg" className='size-5' />
                <span className='absolute -top-3 -right-2 flex size-5.5 items-center justify-center rounded-full bg-[#344054] text-[10px] font-medium text-white'>
                  0
                </span>
              </div>
            ))}
            <div className='relative flex items-center justify-center border rounded-full '>
              <Image src={profileIcon} alt="profile" width={40} height={40} className='size-9 rounded-full' />

            </div>
          </div>
          :
          <div className="flex gap-2 shrink-0">
            <ButtonTemplate
              className=" bg-white text-[#344054] border whitespace-nowrap hover:bg-white"
              title="Login"
              onClick={() => router.push('/auth/login')}
            />
            <ButtonTemplate
              title="Sign up"
              onClick={() => router.push('/auth/sign-up')}
              className=" whitespace-nowrap" />
          </div>}
      </section>
      <section className="flex items-center justify-center bg-black gap-10 text-white text-sm font-semibold h-[50px]">
        {navItems.map((item, index) =>
          item.name === 'Categories' ? (
            <HoverCardTemplate
              key={index}
              trigger={
                <span className='cursor-pointer hover:underline'>{item.name}</span>
              }
              contentClassName=" w-full p-0 overflow-hidden rounded-xl flex-row mt-6"
              content={
                <div className='flex p-3 px-3 bg-white'  >
                  <div className="flex-2 grid grid-cols-2 gap-x-0  gap-y-0  ">
                    {categoriesHoverItems.map((cat, index) => {
                      const Icon = cat.icon
                      return (
                        <div
                          key={cat.title}
                          className="flex items-start gap-3 rounded-sm p-3 cursor-pointer hover:bg-[#F0F2F5] transition-colors"
                          onMouseEnter={() => setHoveredCategoryIndex(index)}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center  bg-white border rounded-xs p-1">
                            <Icon className="size-5 text-[#000000]" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-normal text-[#2A3239] text-xs sm:text-sm">{cat.title}</div>
                            <div className="text-[#637485] text-[8px] sm:text-[10px] mt-0.5">{cat.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-[#252525] rounded-xl p-8 ml-4 flex flex-col  gap-4 w-[220px] ">
                    <Image

                      height={105}
                      src={categoriesHoverItems[hoveredCategoryIndex].image}
                      alt={categoriesHoverItems[hoveredCategoryIndex].title}
                      className="object-cover w-full h-[105px] ] object-center transition-opacity duration-200"
                    />
                  </div>

                </div>
              }
            />
          ) : (
            <span
              key={index}
              className='cursor-pointer hover:underline'
              onClick={() => router.push(item.path)}
            >
              {item.name}
            </span>
          )
        )}
      </section>
    </div>
  )
}