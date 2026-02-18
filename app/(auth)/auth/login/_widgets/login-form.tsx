'use client'
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import Link from 'next/link'
import { CheckboxTemplate } from '@/components/templates/checkbox-template'

export default function LoginForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    return (
        <div className=" px-6 py-12">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Welcome Back!
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-base text-[#13161A] font-normal">
                        Sign Up
                    </Link>
                </p>
            </div>

            {/* Form */}
            <div className='w-[550px]'>
                <div className=' flex flex-col gap-6 mb-2'>
                    <InputTemplate
                        label='Email Address / Phone Number'
                        placeholder={'Enter your email address or phone number'} className='h-11'

                    />
                    <InputTemplate
                        label='Password'
                        placeholder={'Enter your password'} className='h-11'

                        icon={<EyeOff className='w-4 h-4 text-[#667185] hover:cursor-pointer' />}
                        align='inline-end'
                    />

                </div>
                <div className='flex justify-between items-center mb-10'>
                    <CheckboxTemplate label='Remember me' />
                    <div 
                        onClick={() => router.push('/auth/forgot-password')}
                        className='text-sm text-[#475367] font-normal underline hover:cursor-pointer'
                    >
                        Forgot Password?
                    </div>
                </div>
                <ButtonTemplate title='Sign In' className='w-full h-11' onClick={() => {
                    localStorage.setItem('isSignedIn', 'true')
                    router.push('/')
                }} />
            </div>
        </div>
    )
}
