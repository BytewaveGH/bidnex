'use client'
import { useState } from 'react'
import { showToast } from '@/components/templates/toast-template'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'

interface SignupFormData {
    username: string
    email: string
    phone: string
    password: string
    confirmPassword: string
}

export function useSignup(onSuccess: (phone: string) => void, accountType: 'bidder' | 'vendor') {
    const callApi = useUnauthenticatedAxios()

    const [formData, setFormData] = useState<SignupFormData>({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const updateField = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }

    const validate = (): string | null => {
        if (!formData.username.trim()) return 'Username is required'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) return 'Email address is required'
        if (!emailRegex.test(formData.email)) return 'Please enter a valid email address'

        const phoneDigits = formData.phone.replace(/\D/g, '')
        if (!formData.phone.trim()) return 'Phone number is required'
        if (phoneDigits.length !== 10) return 'Phone number must be exactly 10 digits'

        if (formData.password.length < 8) return 'Password must be at least 8 characters'

        if (!formData.confirmPassword) return 'Please confirm your password'
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match'

        return null
    }

    const handleSubmit = async () => {
        const error = validate()
        if (error) {
            showToast('failure', error)
            return
        }

        setIsLoading(true)
        try {
            const response: any = await callApi({
                method: 'POST',
                url: '/auth/register',
                data: {
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    accountType,
                },
            })

            if (response.status >= 400) {
                showToast('failure', response.data?.error || 'Registration failed. Please try again.')
                return
            }

            showToast('success', 'Account created! Please verify your phone number.')
            onSuccess(formData.phone)
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            showToast('failure', message ?? 'Network error. Please check your connection and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        formData,
        updateField,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        isLoading,
        handleSubmit,
    }
}
