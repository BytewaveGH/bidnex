'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/templates/toast-template'

export function useVendorLogin() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (!username.trim()) {
            showToast('failure', 'Username is required')
            return
        }
        if (!password) {
            showToast('failure', 'Password is required')
            return
        }

        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                username,
                password,
                tenant: 'vendor',
                redirect: false,
                callbackUrl: '/vendor/dashboard/home',
            })

            if (result?.error) {
                showToast('failure', 'Invalid credentials. Please try again.')
                return
            }

            router.push('/vendor/dashboard/home')
        } catch {
            showToast('failure', 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isLoading,
        handleSubmit,
    }
}
