'use client'
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import Link from 'next/link'
import { CheckboxTemplate } from '@/components/templates/checkbox-template'

export default function SignupForm({onChangePage}: {onChangePage: () => void}) {
    const router = useRouter()
   
    const [newPassword, setNewPassword] = useState('')
   const [showNewPassword, setShowNewPassword] = useState(false)
    

    return (
        <div className=" px-6 py-12">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Let's Get You Started!
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-base text-[#13161A] font-normal">
                        Sign In
                    </Link>
                </p>
            </div>

            {/* Form */}
            <div className='w-[550px]'>
                <div className=' flex flex-col gap-6 mb-8'>
                    <InputTemplate
                        label='Email Address'
                        placeholder={'Enter your email address'} className='h-11'

                    />
                    <InputTemplate
                        label='Phone Number'
                        placeholder={'Enter your phone number'} className='h-11'

                    />
                   <InputTemplate 
                    label='Password'
                    placeholder='Enter your new password'
                    className='h-11'
                    icon={showNewPassword ? <Eye className='w-4 h-4 text-[#667185] mr-2' /> : <EyeOff className='w-4 h-4 text-[#667185] mr-2' />}
                    align='inline-end'
                    description='Must be at least 8 characters.'
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPasswordStrength={true}
                    onIconClick={() => setShowNewPassword(!showNewPassword)}
                />

                </div>
            
                <ButtonTemplate title='Sign Up' className='w-full h-11' onClick={onChangePage} />
            </div>
        </div>
    )
}
