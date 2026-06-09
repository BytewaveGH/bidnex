'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import authImg from '@/assets/images/auth.png'
import Logo from '@/components/templates/logo'
import legalHammer from '@/assets/svgs/legal-hammer.svg'
import SignupForm from './signup-form'
import OtpForm from './otp-form'
import { useRouter } from 'next/navigation'

type AccountType = 'bidder' | 'vendor'

const slides = [
    {
        text: "Auctions allow buyers to compete openly for items, with prices rising only when there is real demand. This makes bidding one of the fairest ways to buy.",
    },
    {
        text: "List your items, set your prices, and let buyers compete for your goods. Our platform makes it easy to reach thousands of active bidders.",
    },
    {
        text: "Get the best value for your inventory. Sellers consistently achieve higher returns through competitive bidding than fixed-price listings.",
    },
]

export default function Signup({ initialType = 'bidder' }: { initialType?: AccountType }) {
    const [page, setPage] = useState<'signup' | 'otp'>('signup')
    const [accountType, setAccountType] = useState<AccountType>(initialType)
    const [registeredPhone, setRegisteredPhone] = useState('')
    const [current, setCurrent] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    const handleSignupSuccess = (phone: string) => {
        setRegisteredPhone(phone)
        setPage('otp')
    }

    return (
        <main className="min-h-screen">
            <section className="flex min-h-screen gap-40">
                <div className="hidden md:block md:w-1/2 relative">
                    <div className="h-svh py-4 mr-8 relative">
                        <div className="h-full w-full relative mx-4 rounded-xl overflow-hidden">
                            <Image src={authImg} layout="fill" objectFit="cover" alt="Sign up" className="rounded-xl" />

                            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/90 p-8 lg:p-8 z-10">
                                <div className="flex flex-col items-start justify-between h-full">
                                    <Logo className='text-white text-3xl font-semibold' />

                                    <div className="flex items-center justify-center w-full">
                                        <div className="bg-[#2C292A] w-full max-w-sm rounded-xl p-5 flex flex-col items-center gap-5">
                                            <div className="bg-white rounded-full flex items-center justify-center w-10 h-10 shrink-0">
                                                <Image src={legalHammer} alt="" className="w-5 h-5" />
                                            </div>

                                            <div className="relative w-full overflow-hidden" style={{ minHeight: '96px' }}>
                                                {slides.map((slide, i) => (
                                                    <p
                                                        key={i}
                                                        className={`text-white text-center text-sm leading-relaxed transition-all duration-500 ${
                                                            i === current
                                                                ? 'opacity-100 translate-x-0'
                                                                : i < current
                                                                ? 'opacity-0 -translate-x-full absolute inset-0'
                                                                : 'opacity-0 translate-x-full absolute inset-0'
                                                        }`}
                                                    >
                                                        {slide.text}
                                                    </p>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-center gap-1.5">
                                                {slides.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrent(i)}
                                                        className={`rounded-full transition-all duration-300 ${
                                                            i === current
                                                                ? 'w-5 h-2 bg-white'
                                                                : 'w-2 h-2 bg-[#667185]'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex items-center justify-start min-h-screen">
                    {page === 'signup' ? (
                        <SignupForm
                            onChangePage={handleSignupSuccess}
                            accountType={accountType}
                            onAccountTypeChange={setAccountType}
                        />
                    ) : (
                        <OtpForm
                            phone={registeredPhone}
                            accountType={accountType}
                            onChangePage={() => router.push('/auth/login')}
                        />
                    )}
                </div>
            </section>
        </main>
    )
}
