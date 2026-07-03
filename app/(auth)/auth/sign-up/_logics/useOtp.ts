'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { showToast } from '@/components/templates/toast-template'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'

export function useOtp(phone: string, onSuccess: () => void, accountType: 'bidder' | 'vendor') {
    const callApi = useUnauthenticatedAxios()
    const [otp, setOtp] = useState('')
    const [timeLeft, setTimeLeft] = useState(59)
    const [isVerifying, setIsVerifying] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const hasSentRef = useRef(false)

    const sendOtp = useCallback(async () => {
        setIsSending(true)
        try {
            const response: any = await callApi({
                method: 'POST',
                url: '/auth/send-otp',
                headers: { 'X-Tenant-Domain': accountType },
                data: { phone },
            })
            if (response.status >= 400) {
                showToast('failure', response.data?.message || 'Failed to send OTP.')
                return
            }
            showToast('success', response.data?.message || 'OTP sent successfully.')
            setTimeLeft(59)
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            showToast('failure', message ?? 'Failed to send OTP. Please try again.')
        } finally {
            setIsSending(false)
        }
    }, [phone, accountType])

    useEffect(() => {
        if (hasSentRef.current) return
        hasSentRef.current = true
        sendOtp()
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
        return () => clearTimeout(timer)
    }, [timeLeft])

    const verifyOtp = async () => {
        if (otp.length < 6) {
            showToast('failure', 'Please enter the 6-digit code.')
            return
        }
        setIsVerifying(true)
        try {
            const response: any = await callApi({
                method: 'POST',
                url: '/auth/verify-otp',
                headers: { 'X-Tenant-Domain': accountType },
                params: { username: phone, getToken: true },
                data: { otp },
            })
            if (response.status >= 400) {
                showToast('failure', response.data?.message || 'Invalid OTP. Please try again.')
                return
            }
            showToast('success', 'Phone verified successfully!')
            onSuccess()
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            showToast('failure', message ?? 'Something went wrong. Please try again.')
        } finally {
            setIsVerifying(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return {
        otp,
        setOtp,
        timeLeft,
        formattedTime: formatTime(timeLeft),
        canResend: timeLeft === 0,
        isVerifying,
        isSending,
        sendOtp,
        verifyOtp,
    }
}
