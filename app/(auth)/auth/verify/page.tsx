'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import OtpForm from '../sign-up/_widgets/otp-form'

const roleRedirects: Record<string, string> = {
  vendor: '/vendor/dashboard/home',
  bidder: '/bidder/all-items',
}

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const phone = searchParams.get('phone') ?? ''
  const accountType = (searchParams.get('accountType') ?? 'bidder') as 'bidder' | 'vendor'

  function handleSuccess() {
    router.replace(roleRedirects[accountType] ?? '/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <OtpForm phone={phone} accountType={accountType} onChangePage={handleSuccess} />
    </main>
  )
}
