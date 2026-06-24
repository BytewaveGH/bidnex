'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import OtpForm from '../sign-up/_widgets/otp-form'

const roleRedirects: Record<string, string> = {
  vendor: '/vendor/dashboard/home',
  bidder: '/bidder/all-items',
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const phone = searchParams.get('phone') ?? ''
  const accountType = (searchParams.get('accountType') ?? 'bidder') as 'bidder' | 'vendor'

  function handleSuccess() {
    router.replace(roleRedirects[accountType] ?? '/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm">
        <OtpForm phone={phone} accountType={accountType} onChangePage={handleSuccess} />
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
