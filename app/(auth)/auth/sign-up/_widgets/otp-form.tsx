'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ButtonTemplate from '@/components/templates/button-template'
import InputTemplate from '@/components/templates/input-template'
import Link from 'next/link'

export default function OtpForm({onChangePage}: {onChangePage: () => void}) {
    const router = useRouter()
    const [otp, setOtp] = useState('')
    const [timeLeft, setTimeLeft] = useState(59)

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
        <div className=" px-6 py-12">
            {/* Welcome Section */}
            <div className="mb-4">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                 Enter Verification Code
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    We've sent a code to {' '}
                    <Link href="/auth/login" className="text-base text-[#13161A] font-normal underline">
                    0555888111
                    </Link>
                </p>
            </div>

            {/* OTP Input Fields */}
            <div className='w-[550px]'>
                <div className='mb-4'>
                    <InputTemplate
                        placeholder="-"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        otpLength={6}
                        className="mb-0"
                    />
                </div>

                {/* Resend Timer */}
                <div className='mb-8'>
                    <p className="text-sm text-[#657688] font-normal">
                        Resend code in {' '}
                        <span className="text-sm text-[#13161A] font-semibold underline">
                            {formatTime(timeLeft)}
                        </span>
                    </p>
                </div>
            
                <ButtonTemplate title='Verify Account' className='w-full h-11' onClick={onChangePage} />
            </div>
        </div>
    )
}
