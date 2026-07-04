'use client'

import { use } from 'react'
import TopNav from '@/components/generals/top-nav'
import Footer from '@/components/generals/footer'
import BlogPostView from './_widgets/blog-post'

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)

    return (
        <main className="min-h-screen w-full">
            <TopNav />
            <section className="page-container py-10 md:py-20">
                <BlogPostView slug={slug} />
            </section>
            <section className="page-container pt-10 md:pt-20">
                <Footer />
            </section>
        </main>
    )
}
