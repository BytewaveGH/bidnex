'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, MoveLeft } from 'lucide-react'
import ButtonTemplate from '@/components/templates/button-template'
import BlogPostCard from '@/components/generals/blog-post-card'
import { CATEGORY_STYLES, formatBlogDate, getPostBySlug, getRelatedPosts } from '../../_data/posts'

export default function BlogPostView({ slug }: { slug: string }) {
    const router = useRouter()
    const post = getPostBySlug(slug)

    if (!post) {
        return (
            <div className="w-full py-20 text-center">
                <p className="text-[#657688] mb-6">This post doesn&apos;t exist or may have been moved.</p>
                <Link href="/blog">
                    <ButtonTemplate title="Back to Blog" className="bg-black text-white hover:bg-black w-fit px-8" />
                </Link>
            </div>
        )
    }

    const style = CATEGORY_STYLES[post.category]
    const related = getRelatedPosts(post.slug)

    return (
        <div className="w-full">
            <div className="mb-8">
                <ButtonTemplate
                    title={<MoveLeft className="w-4 h-4" />}
                    className="bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer"
                    onClick={() => router.push('/blog')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                <div className="relative w-full aspect-square lg:aspect-auto lg:min-h-[520px] rounded-2xl overflow-hidden bg-[#F7F9FC]">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                    />
                </div>

                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold mb-3" style={{ color: style.bg }}>
                        {post.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-[#98A2B3] mb-8 flex-wrap">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{formatBlogDate(post.date)}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>

                    <article className="space-y-4 flex-1">
                        {post.content.map((paragraph, index) => (
                            <p key={index} className="text-sm sm:text-base text-[#344054] leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </article>

                    {post.callout && (
                        <div className="mt-8 rounded-2xl p-5 sm:p-6 bg-[#F7F9FC]">
                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{post.callout.title}</h3>
                            <p className="text-sm text-[#515F6E] leading-relaxed">{post.callout.body}</p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#F0F2F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-sm text-[#657688]">Ready to put this into practice?</p>
                        <Link
                            href="/bidder/all-items"
                            className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
                        >
                            Explore Live Auctions
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-8">More from the blog</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {related.map((relatedPost) => (
                            <BlogPostCard key={relatedPost.slug} post={relatedPost} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
