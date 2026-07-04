'use client'

import TopNav from '@/components/generals/top-nav'
import Footer from '@/components/generals/footer'
import Blog from './_widgets/blog'

export default function BlogPage() {
    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <section className="page-container py-10 md:py-20">
                <Blog />
            </section>
            <section className="page-container pt-10 md:pt-20">
                <Footer />
            </section>
        </main>
    )
}
