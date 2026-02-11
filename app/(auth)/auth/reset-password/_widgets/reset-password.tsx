'use client'
import Link from 'next/link'
import Logo from '@/components/templates/logo'
import ButtonTemplate from '@/components/templates/button-template'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import emailImg from '@/assets/images/mail_sent.gif'
import InputTemplate from '@/components/templates/input-template'
import { EyeOff, Eye } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { showToast } from '@/components/templates/toast-template'

export default function ResetPassword(
    
) {
    const router = useRouter()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    const meetsMinimumLength = newPassword.length >= 8
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
    const isDisabled = !newPassword || !confirmPassword || !meetsMinimumLength || !passwordsMatch
  return (
    <main className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="w-full px-8 py-6 flex items-center justify-between">
        <Logo className="text-3xl font-bold text-gray-900" />
       
    </header>

    {/* Main Content */}
    <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-6">
        <div className="w-full max-w-md -mt-20">
            {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center -mt-30">
                        Reset Your Password
                    </h1>

            {/* Instructional Text */}
            <p className="text-[15px] text-[#657688] mb-8 text-center">
              Kindly set your new password.
            </p>

            <div className='w-[450px] flex flex-col  mb-4 gap-6'>
                <InputTemplate 
                    label='New Password'
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
                <InputTemplate 
                    label='Confirm Password'
                    placeholder='Enter your password again'
                    className='h-11 mb-4'
                    icon={showConfirmPassword ? <Eye className='w-4 h-4 text-[#667185] mr-2' /> : <EyeOff className='w-4 h-4 text-[#667185] mr-2' />}
                    align='inline-end'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                {confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-red-500 -mt-8">Passwords do not match</p>
                )}
           

                <ButtonTemplate
                disabled={isDisabled}
                onClick={() => {
                    
                    showToast('success', 'Success meessage');
                    // router.push('/auth/login')
                }
                    } title='Save New Password' className='w-full h-11' />
            </div>
           

        </div>
    </div>
</main>
  )
}