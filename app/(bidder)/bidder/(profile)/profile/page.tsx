'use client'

import { useSession } from 'next-auth/react'
import { BadgeCheck, ShieldAlert } from 'lucide-react'
import TopNav from '@/components/generals/top-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function formatUserType(userType?: string) {
  if (!userType) return '—'
  return userType.charAt(0).toUpperCase() + userType.slice(1)
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#F0F2F5] last:border-0">
      <span className="text-sm text-[#657688]">{label}</span>
      <span className="text-sm font-medium text-[#2A3239] text-right truncate">{value}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isLoading = status === 'loading'

  return (
    <main className="min-h-screen w-full bg-[#F9FAFB]">
      <TopNav />
      <section className="page-container py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold text-[#2A3239]">My Profile</h1>
          <p className="text-sm text-[#657688]">View your account details.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 max-w-4xl">
            <div className="h-[240px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
            <div className="h-[280px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 max-w-4xl items-start">
            {/* ── Identity card ── */}
            <div className="border border-[#F0F2F5] rounded-[16px] bg-white p-6 flex flex-col items-center text-center">
              <Avatar className="size-24">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="text-2xl font-semibold bg-[#F0F2F5] text-[#344054]">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-lg font-bold text-[#2A3239] truncate max-w-full">
                {user?.username ?? '—'}
              </h2>
              <p className="text-sm text-[#657688] truncate max-w-full">{user?.email}</p>
              <p className="text-xs text-[#657688] mt-1">{formatUserType(user?.userType)}</p>

              <div className="mt-5 pt-4 border-t border-[#F0F2F5] w-full flex items-center justify-center gap-1.5">
                {user?.isVerified ? (
                  <>
                    <BadgeCheck className="size-4 text-[#099137]" />
                    <span className="text-sm text-[#099137] font-medium">Verified account</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-4 text-[#F3A218]" />
                    <span className="text-sm text-[#F3A218] font-medium">Not verified</span>
                  </>
                )}
              </div>
            </div>

            {/* ── Account information ── */}
            <div className="border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0F2F5]">
                <h3 className="text-sm font-semibold text-[#2A3239]">Account Information</h3>
              </div>
              <div className="px-6">
                <Row label="Username" value={user?.username ?? 'Not provided'} />
                <Row label="Email address" value={user?.email ?? 'Not provided'} />
                <Row label="Phone number" value={user?.phone || 'Not provided'} />
                <Row label="Account type" value={formatUserType(user?.userType)} />
                <Row label="Verification status" value={user?.isVerified ? 'Verified' : 'Not verified'} />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
