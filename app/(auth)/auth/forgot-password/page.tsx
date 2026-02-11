'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ForgotPassword from './_widgets/forgot-password'
import CheckEmail from './_widgets/check-email'

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [page, setPage] = useState<'forgot-password' | 'check-email'>('forgot-password')
    return (
        <>{ 
        page === 'forgot-password' ? <ForgotPassword
        onChangePage={() => setPage('check-email')}
        /> : <CheckEmail
        onChangePage={() => router.push('/auth/reset-password')}
        />
        
        
        }</>
    )
}
