'use client'
import ButtonTemplate from '@/components/templates/button-template'
import InputTemplate from '@/components/templates/input-template'
import { useOtp } from '../_logics/useOtp'

export default function OtpForm({
    onChangePage,
    phone,
    accountType,
}: {
    onChangePage: () => void
    phone: string
    accountType: 'bidder' | 'vendor'
}) {
    const {
        otp,
        setOtp,
        formattedTime,
        canResend,
        isVerifying,
        isSending,
        sendOtp,
        verifyOtp,
    } = useOtp(phone, onChangePage, accountType)

    return (
        <div className="w-full px-6 py-10 md:py-12">
            <div className="mb-4">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Enter Verification Code
                </h1>
                <p className="text-base text-[#657688] font-normal">
                    We&apos;ve sent a code to{' '}
                    <span className="text-base text-[#13161A] font-normal underline">
                        {phone}
                    </span>
                </p>
            </div>

            <div className='w-full max-w-[550px]'>
                <div className='mb-4'>
                    <InputTemplate
                        placeholder="-"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        otpLength={6}
                        className="mb-0"
                    />
                </div>

                <div className='mb-8'>
                    {canResend ? (
                        <button
                            onClick={sendOtp}
                            disabled={isSending}
                            className="text-sm text-[#13161A] font-semibold underline disabled:opacity-50"
                        >
                            {isSending ? 'Sending...' : 'Resend code'}
                        </button>
                    ) : (
                        <p className="text-sm text-[#657688] font-normal">
                            Resend code in{' '}
                            <span className="text-sm text-[#13161A] font-semibold underline">
                                {formattedTime}
                            </span>
                        </p>
                    )}
                </div>

                <ButtonTemplate
                    title={isVerifying ? 'Verifying...' : 'Verify Account'}
                    className='w-full h-11'
                    onClick={verifyOtp}
                    disabled={isVerifying || otp.length < 6}
                />
            </div>
        </div>
    )
}
