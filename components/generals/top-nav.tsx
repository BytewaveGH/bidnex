'use client'
import React, { useState } from 'react'
import ButtonTemplate from '../templates/button-template'
import InputTemplate from '../templates/input-template'
import Logo from '../templates/logo'

export default function TopNav() {
    const [navItems, setNavItems] = useState<string[]>(['All Items', 'Categories', 'Buy Now', 'Popular'])
  return (
    <div className="sticky top-0 z-50 bg-white">
         <section className=" py-4 flex px-20 justify-between items-center h-full w-full gap-4 min-w-0">
        <Logo />
        <InputTemplate 
        placeholder="Search for anything"
        className="flex-1 min-w-0 max-w-[533px] h-[40px] shadow-none rounded-[100px]"
        />
        <div className="flex gap-2 shrink-0">
          <ButtonTemplate 
          className=" bg-white text-[#344054] border whitespace-nowrap hover:bg-white"
          title="Login"
          />
          <ButtonTemplate 
          title="Sign up"
          className=" whitespace-nowrap" />
        </div>
      </section>
      <section className="flex items-center justify-center bg-black gap-10 text-white text-sm font-semibold h-[50px]">
        {navItems.map((item, index) => (
            <span key={index} className='cursor-pointer  hover:underline'>{item}</span>
        ))}
      </section>
    </div>
  )
}