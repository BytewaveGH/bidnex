'use client'
import { Eye, EyeOff } from 'lucide-react'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import Link from 'next/link'
import { useSignup } from '../_logics/useSignup'

type AccountType = 'bidder' | 'vendor'

export default function SignupForm({
    onChangePage,
    accountType,
    onAccountTypeChange,
}: {
    onChangePage: (phone: string) => void
    accountType: AccountType
    onAccountTypeChange: (type: AccountType) => void
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
    } = useSignup(onChangePage, accountType)

    return (
        <div className="w-full px-6 py-10 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Let&apos;s Get You Started!
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-base text-[#13161A] font-normal">
                        Sign In
                    </Link>
                </p>
            </div>

            <form className='w-full max-w-[550px]' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {/* Account type toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
                    {(['bidder', 'vendor'] as AccountType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            disabled={isLoading}
                            className={`flex-1 h-11 text-sm font-medium transition-colors capitalize ${
                                accountType === type
                                    ? 'bg-[#13161A] text-white'
                                    : 'text-[#657688] hover:text-[#13161A] hover:bg-gray-50'
                            }`}
                            onClick={() => onAccountTypeChange(type)}
                        >
                            {type === 'bidder' ? 'Bidder' : 'Vendor'}
                        </button>
                    ))}
                </div>

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
                        icon={showPassword ? <Eye className='w-4 h-4 text-[#667185] mr-2' /> : <EyeOff className='w-4 h-4 text-[#667185] mr-2' />}
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
                        icon={showConfirmPassword ? <Eye className='w-4 h-4 text-[#667185] mr-2' /> : <EyeOff className='w-4 h-4 text-[#667185] mr-2' />}
                        align='inline-end'
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={updateField('confirmPassword')}
                        onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </div>

                <ButtonTemplate
                    title={isLoading ? 'Creating Account...' : `Sign Up as ${accountType === 'bidder' ? 'Bidder' : 'Vendor'}`}
                    className='w-full h-11'
                    type="submit"
                    disabled={isLoading}
                />
            </form>
        </div>
    )
}
