'use client'
import Link from 'next/link'
import Logo from '@/components/templates/logo'
import ButtonTemplate from '@/components/templates/button-template'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import emailImg from '@/assets/images/mail_sent.gif'

export default function CheckEmail(
    {onChangePage}: {onChangePage: () => void}
) {
    const router = useRouter()
  return (
    <main className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="w-full px-8 py-6 flex items-center justify-between">
        <Logo className="text-3xl font-bold text-gray-900" />
        <p className="text-base text-[#657688] font-normal">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-base text-black underline hover:cursor-pointer font-normal">
                Sign Up
            </Link>
        </p>
    </header>

    {/* Main Content */}
    <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-6">
        <div className="w-full max-w-md -mt-20">
            {/* Title */}
            <Image src={emailImg} alt='email' width={500} height={500} className=''/>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center -mt-30">
                    Check Your Email
                </h1>

            {/* Instructional Text */}
            <p className="text-sm text-gray-600 mb-8 text-center">
               To proceed with resetting your password, please look for <br/>an email we sent you.
            </p>

            <div className='w-[450px] flex flex-col  mb-4 '>
           

                <ButtonTemplate onClick={onChangePage} title='Open Email' className='w-full h-11' />
            </div>
            <div className='flex justify-center gap-2'>
                {/* <ChevronLeft className=' text-[#2A3239] ' /> */}
                <div className='flex items-center gap-2 text-[#2A3239] text-base underline hover:cursor-pointer hover:underline font-semibold' onClick={() => {}}>
                  Resend Email
                </div>
            </div>

        </div>
    </div>
</main>
  )
}