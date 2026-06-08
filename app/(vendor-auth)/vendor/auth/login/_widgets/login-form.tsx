'use client'
import { Eye, EyeOff } from 'lucide-react'
import InputTemplate from '@/components/templates/input-template'
import ButtonTemplate from '@/components/templates/button-template'
import Link from 'next/link'
import { useVendorLogin } from '../_logics/useLogin'

export default function VendorLoginForm() {
    const {
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isLoading,
        handleSubmit,
    } = useVendorLogin()

    return (
        <div className="px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Welcome Back!
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    Don't have an account?{' '}
                    <Link href="/vendor/auth/sign-up" className="text-base text-[#13161A] font-normal">
                        Sign Up
                    </Link>
                </p>
            </div>

            <div className='w-[550px]'>
                <div className='flex flex-col gap-6 mb-8'>
                    <InputTemplate
                        label='Email / Phone / Username'
                        placeholder='Enter your email, phone, or username'
                        className='h-11'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <InputTemplate
                        label='Password'
                        placeholder='Enter your password'
                        className='h-11'
                        icon={showPassword
                            ? <Eye className='w-4 h-4 text-[#667185] mr-2' />
                            : <EyeOff className='w-4 h-4 text-[#667185] mr-2' />
                        }
                        align='inline-end'
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onIconClick={() => setShowPassword(!showPassword)}
                    />
                </div>

                <ButtonTemplate
                    title={isLoading ? 'Signing In...' : 'Sign In'}
                    className='w-full h-11'
                    onClick={handleSubmit}
                    disabled={isLoading}
                />
            </div>
        </div>
    )
}
