'use client'

import Image from 'next/image'
import authImg from '@/assets/images/auth.png'
import Logo from '@/components/templates/logo'
import { Dot, MessageSquareText } from 'lucide-react'
import SignupForm from './signup-form'
import OtpForm from './otp-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AccountType = 'bidder' | 'vendor'

export default function Signup({ initialType = 'bidder' }: { initialType?: AccountType }) {
    const [page, setPage] = useState<'signup' | 'otp'>('signup')
    const [accountType, setAccountType] = useState<AccountType>(initialType)
    const [registeredPhone, setRegisteredPhone] = useState('')
    const router = useRouter()

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
                            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/90 p-20 z-10">
                                <div className="flex flex-col items-start justify-between h-full">
                                    <Logo className='text-white text-5xl font-semibold' />
                                    <div className="flex items-center justify-center w-full">
                                        <div className="bg-[#2C292A] w-3/5 rounded-xl p-4 flex flex-col items-center justify-center gap-6">
                                            <div className='bg-white rounded-full flex items-center justify-center w-10 h-10'>
                                                <MessageSquareText className='w-4 h-4 text-black' />
                                            </div>
                                            <div className="text-white text-center">
                                                {accountType === 'vendor'
                                                    ? <>List your items, set your prices, and<br />let buyers compete for your goods.<br />Our platform makes it easy to reach<br />thousands of active bidders and get<br />the best value for your inventory.</>
                                                    : <>Auctions allow buyers to compete<br />openly for items, with prices rising only<br />when there is real demand. This makes<br />bidding one of the fairest ways to buy,<br />and many bidders end up paying less<br />than fixed prices.</>
                                                }
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <Dot className='w-8 h-8 text-white' />
                                                <Dot className='w-8 h-8 text-[#667185]' />
                                                <Dot className='w-8 h-8 text-[#667185]' />
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
