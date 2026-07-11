'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopNav from '@/components/generals/top-nav'
import Footer from '@/components/generals/footer'
import Blog from './_widgets/blog'

function BlogContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams.get('search') ?? undefined

    function handleSearch(query: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (query) params.set('search', query)
        else params.delete('search')
        const qs = params.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
    }

    return (
        <main className="min-h-screen w-full">
            <TopNav onSearch={handleSearch} initialSearchValue={search} />
            <section className="page-container py-10 md:py-20">
                <Blog search={search} />
            </section>
            <section className="page-container pt-10 md:pt-20">
                <Footer />
            </section>
        </main>
    )
}

export default function BlogPage() {
    return (
        <Suspense>
            <BlogContent />
        </Suspense>
    )
}
