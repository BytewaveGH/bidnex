'use client'
import React from 'react'
import Link from 'next/link'
import Logo from '@/components/templates/logo'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
    const router = useRouter()
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="w-full px-8 py-6 flex items-center justify-between">
                <Logo className="text-3xl font-bold text-gray-900" />
                <p className="text-base text-[#657688] font-normal">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-base text-black underline hover:cursor-pointer font-normal">
                        Sign Up
                    </Link>
                </p>
            </header>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-6">
                <div className="w-full max-w-md">
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Forgot Password?
                    </h1>

                    {/* Instructional Text */}
                    <p className="text-sm text-gray-600 mb-8 text-center">
                        Enter the email address you registered<br />your account with.
                    </p>

                    <div className='w-[450px] flex flex-col gap-6 mb-4 '>
                        <div className=' '>
                            <InputTemplate
                                label='Email Address / Phone Number'
                                placeholder={'Enter your email address or phone number'} className='h-11'

                            />


                        </div>

                        <ButtonTemplate title='Send Email' className='w-full h-11' />
                    </div>
                    <div className='flex justify-center gap-2'>
                        <ChevronLeft className=' text-[#2A3239] ' />
                        <div className='flex items-center gap-2 text-[#2A3239] text-base hover:cursor-pointer hover:underline' onClick={() => router.push('/auth/login')}>
                            Back to Sign In
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
