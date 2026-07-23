'use client'
import { useState } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'
import { signIn } from 'next-auth/react'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import Link from 'next/link'
import { useSignup } from '../_logics/useSignup'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g fill="none" fillRule="evenodd">
        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </g>
    </svg>
  )
}


export default function SignupForm({
    onChangePage,
}: {
    onChangePage: (phone: string) => void
}) {
    const {
        formData,
        updateField,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        isLoading,
        handleSubmit,
    } = useSignup(onChangePage)

    const [isSocialLoading, setIsSocialLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsSocialLoading(true)
        await signIn('google', { redirectTo: '/auth/social-callback' })
    }

    return (
        <div className="w-full px-6 py-10 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Let&apos;s Get You Started!
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-base text-[#13161A] font-normal underline">
                        Sign In
                    </Link>
                </p>
            </div>

            <form className='w-full max-w-[550px]' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className='flex flex-col gap-6 mb-8'>
                    <InputTemplate
                        label='Username'
                        placeholder='Enter your username'
                        className='h-11'
                        value={formData.username}
                        onChange={updateField('username')}
                    />
                    <InputTemplate
                        label='Email Address'
                        placeholder='Enter your email address'
                        className='h-11'
                        value={formData.email}
                        onChange={updateField('email')}
                        type='email'
                    />
                    <InputTemplate
                        label='Phone Number'
                        placeholder='Enter your phone number'
                        className='h-11'
                        value={formData.phone}
                        onChange={updateField('phone')}
                        type='tel'
                    />
                    <InputTemplate
                        label='Password'
                        placeholder='Enter your password'
                        className='h-11'
                        icon={showPassword ? <Eye className='w-4 h-4 text-[#667185]' /> : <EyeOff className='w-4 h-4 text-[#667185]' />}
                        align='inline-end'
                        description='Must be at least 8 characters.'
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={updateField('password')}
                        showPasswordStrength={true}
                        onIconClick={() => setShowPassword(!showPassword)}
                    />
                    <InputTemplate
                        label='Confirm Password'
                        placeholder='Re-enter your password'
                        className='h-11'
                        icon={showConfirmPassword ? <Eye className='w-4 h-4 text-[#667185]' /> : <EyeOff className='w-4 h-4 text-[#667185]' />}
                        align='inline-end'
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={updateField('confirmPassword')}
                        onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </div>

                <ButtonTemplate
                    title={isLoading ? 'Creating Account...' : 'Create Account'}
                    className='w-full h-11'
                    type="submit"
                    disabled={isLoading || isSocialLoading}
                />
                <p className="text-xs text-[#98A2B3] font-normal mt-2 flex items-center justify-center gap-1.5">
                    <Info className="size-3.5 shrink-0" />
                    One account, buy or sell — switch to Vendor mode anytime after signing up.
                </p>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-[#E4E7EC]" />
                    <span className="text-sm text-[#98A2B3]">or</span>
                    <div className="flex-1 h-px bg-[#E4E7EC]" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isSocialLoading}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <GoogleIcon />
                    {isSocialLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>
            </form>
        </div>
    )
}
