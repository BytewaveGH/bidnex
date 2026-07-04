import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CATEGORY_STYLES, formatBlogDate, type BlogPost } from '@/app/blog/_data/posts'

export default function BlogPostCard({ post }: { post: BlogPost }) {
    const style = CATEGORY_STYLES[post.category]

    return (
        <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#F7F9FC]">
                <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold" style={{ color: style.bg }}>
                    {post.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:underline">
                    {post.title}
                </h3>
                <p className="text-sm text-[#657688] leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-[#98A2B3] min-w-0">
                        <span className="truncate">{post.author.split(',')[0]}</span>
                        <span>•</span>
                        <span className="shrink-0">{formatBlogDate(post.date)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 shrink-0">
                        Read
                        <ArrowUpRight className="size-4" />
                    </span>
                </div>
            </div>
        </Link>
    )
}
