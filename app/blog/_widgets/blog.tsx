'use client'

import { useMemo, useState } from 'react'
import BlogPostCard from '@/components/generals/blog-post-card'
import ButtonTemplate from '@/components/templates/button-template'
import { BLOG_CATEGORIES, blogPosts, type BlogCategory } from '../_data/posts'

type Filter = BlogCategory | 'All'

type BlogProps = {
    search?: string
}

export default function Blog({ search }: BlogProps) {
    const [active, setActive] = useState<Filter>('All')
    const filtered = useMemo(() => {
        const byCategory = active === 'All' ? blogPosts : blogPosts.filter((post) => post.category === active)
        if (!search) return byCategory
        const q = search.toLowerCase()
        return byCategory.filter((post) => post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q))
    }, [active, search])

    return (
        <div className="w-full">
            {/* Header */}
            {/* <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
                <div>
                    <span className="inline-block text-xs font-semibold tracking-wide text-black bg-[#FFCC00] rounded-full px-3 py-1.5 mb-4">
                        Blog
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                        Bidding smarter,<br className="hidden sm:block" /> buying better.
                    </h1>
                </div>
                <p className="text-[#657688] text-base leading-relaxed max-w-md md:text-right">
                    Tips for bidders, playbooks for vendors, and updates on how BidChale works.
                </p>
            </div> */}

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#F0F2F5] mb-10">
                {(['All', ...BLOG_CATEGORIES] as Filter[]).map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActive(cat)}
                        className={`text-sm font-medium pb-3 border-b-2 -mb-px transition-colors cursor-pointer ${
                            active === cat
                                ? 'border-black text-gray-900'
                                : 'border-transparent text-[#657688] hover:text-gray-900'
                        }`}
                    >
                        {cat === 'All' ? 'View all' : cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-16">
                    {filtered.map((post) => (
                        <BlogPostCard key={post.slug} post={post} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-[#657688] py-10 mb-6">
                    {search ? 'No posts match your search.' : 'No posts in this category yet.'}
                </p>
            )}

            {/* WhatsApp CTA */}
            <div className="bg-black rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-white text-xl font-semibold mb-2">Never miss a drop.</h3>
                    <p className="text-white/70 text-sm leading-relaxed max-w-md">
                        Join our WhatsApp community for early access to hot lots, price drops, and auction alerts.
                    </p>
                </div>
                <a
                    href="https://chat.whatsapp.com/K7YL6Dr5qFiGtRzFxkphAO?mode=gi_t"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                >
                    <ButtonTemplate
                        title="Join on WhatsApp"
                        className="bg-white text-gray-900 hover:bg-white px-8 py-3 rounded-lg h-[40px] whitespace-nowrap"
                    />
                </a>
            </div>
        </div>
    )
}
