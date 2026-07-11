export type BlogCategory =
    | 'Bidding Tips'
    | 'Buying Guide'
    | 'Vendor Resources'
    | 'Platform Updates'
    | 'Success Stories'

export const BLOG_CATEGORIES: BlogCategory[] = [
    'Bidding Tips',
    'Buying Guide',
    'Vendor Resources',
    'Platform Updates',
    'Success Stories',
]

export const CATEGORY_STYLES: Record<BlogCategory, { bg: string; text: string; tint: string }> = {
    'Bidding Tips': { bg: '#099137', text: '#FFFFFF', tint: '#E7F6EC' },
    'Buying Guide': { bg: '#003C71', text: '#FFFFFF', tint: '#E8F0F8' },
    'Vendor Resources': { bg: '#F3A218', text: '#FFFFFF', tint: '#FEF3E2' },
    'Platform Updates': { bg: '#252525', text: '#FFFFFF', tint: '#F0F2F5' },
    'Success Stories': { bg: '#FFCC00', text: '#1A1A1A', tint: '#FFF9E0' },
}

export type BlogPost = {
    slug: string
    title: string
    excerpt: string
    category: BlogCategory
    coverImage: string
    author: string
    date: string
    readTime: string
    featured?: boolean
    content: string[]
    callout?: { title: string; body: string }
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'max-bids-explained',
        title: 'Max Bids Explained: Let BidChale Bid For You',
        excerpt:
            "Tired of refreshing the page every few minutes to defend your lead? Here's exactly how setting a max bid lets BidChale compete on your behalf — automatically, and only when it needs to.",
        category: 'Bidding Tips',
        coverImage:
            'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-18',
        readTime: '4 min read',
        featured: true,
        content: [
            "Every serious bidder has been there: you place a bid, close the tab, and by the time you check back someone has outbid you by a few cedis and the auction has moved on. Max Bid exists to remove that anxiety entirely. Instead of placing one bid at a time, you tell BidChale the absolute most you're willing to pay for a lot, and the system bids on your behalf in small increments — just enough to keep you in the lead, and never more than you approved.",
            "Here's the mechanic in plain terms: say the current bid on a lot is GHS 200 and the increment is GHS 20. If you set a max bid of GHS 400, BidChale places GHS 220 for you right away. If another bidder comes in at GHS 260, the system automatically raises you to GHS 280 — still comfortably under your cap. You only get outbid once someone's true ceiling is higher than yours, and even then you'll know immediately because your card flips from a green WINNING ribbon to an amber OUTBID one.",
            "Max Bid pairs well with another feature worth knowing about: anti-snipe protection. If a bid lands in the final moments of an auction, the clock automatically extends by three minutes — you'll see a yellow +3mins flash on the lot card — so a last-second sniper can't win a lot you were actively contesting. Between the two, you can genuinely set a budget, walk away, and trust the system to fight fair on your behalf.",
            "One caution: a max bid is a commitment, not a suggestion. If you win at your ceiling, you're expected to complete payment within the standard 24–48 hour window like any other win. Set a number you'd actually be happy paying, not just the number you hope you'll never reach.",
        ],
        callout: {
            title: 'Try it on your next watch',
            body: 'Add a lot to your Watchlist, set a max bid before the final hour, and let BidChale handle the back-and-forth while you do literally anything else.',
        },
    },
    {
        slug: '5-tips-win-auction-without-overpaying',
        title: '5 Tips to Win Your Next Auction Without Overpaying',
        excerpt:
            'Winning a lot feels great — winning it for a fair price feels better. Here are five habits our most consistent bidders swear by.',
        category: 'Bidding Tips',
        coverImage:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-05',
        readTime: '4 min read',
        content: [
            "Check the market price before you bid, not after. Every lot on BidChale shows an MKT PR figure alongside the current bid — that's your ceiling reference, not your target. If the current bid is already brushing up against market price with days left on the clock, that's usually a sign to move on rather than chase it.",
            "Bid in the lot's quiet hours. Auctions tend to see the heaviest competing bids in the final hour before close, when everyone's watchlist notifications go off at once. If a lot genuinely interests you, place a modest early bid and set a max bid rather than waiting to duel it out at the buzzer — you'll often win at a lower price simply because fewer people are paying attention early on.",
            "Read the condition badge, not just the photos. Lots are tagged New/Like New, Good Condition, or Used for a reason, and vendors are required to describe wear accurately. A slightly lower bid on a Good Condition item can beat a higher bid on a New one if it does the job just as well for you.",
            "Use Buy Now when the math works in your favor. Some lots carry a Buy Now price alongside the live auction — if the current bid trajectory suggests it'll blow past that number anyway, locking it in early saves you both money and the wait.",
            "Don't ignore bidder count. A lot with a high BIDS count and only modest price movement usually means a lot of small increment battles, not a runaway price — those can be some of the best value lots on the platform if you're willing to be patient.",
        ],
    },
    {
        slug: 'buy-now-vs-bidding',
        title: 'Buy Now vs. Bidding: Which One Should You Choose?',
        excerpt:
            "Both get you the item. One trades certainty for a wait; the other trades patience for a lower possible price. Here's how to decide.",
        category: 'Buying Guide',
        coverImage:
            'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-12',
        readTime: '4 min read',
        content: [
            "Every lot on BidChale that carries a Buy Now price gives you a genuine choice: keep bidding and see where the auction lands, or pay the fixed price immediately and skip the wait entirely. Neither option is objectively better — it depends on how much you value certainty versus the chance of a lower final price.",
            "Bidding makes sense when a lot has plenty of time left, modest early interest, and a Buy Now price that's noticeably higher than where similar lots have historically closed. You're trading a bit of patience for the possibility of paying meaningfully less.",
            "Buy Now makes sense when the item is scarce, the countdown is already in its final hours with rising bids, or you simply need the item and can't risk losing it to someone else's max bid. It's also the safer move if you've been outbid on a lot once already and don't want to relive that anti-snipe extension a second time.",
            "A middle path many bidders use: set a max bid at roughly what you'd have paid via Buy Now anyway. If the auction stays quiet, you win for less. If it heats up, you're never worse off than the price you'd already accepted.",
        ],
        callout: {
            title: 'Quick rule of thumb',
            body: "If a lot's Buy Now price and current bid are within 10–15% of each other with the clock winding down, Buy Now is almost always the better value — the auction has effectively already told you where the price is headed.",
        },
    },
    {
        slug: 'spot-a-genuine-deal-on-electronics',
        title: 'How to Spot a Genuine Deal on Electronics & Gadgets',
        excerpt:
            "Electronics move fast on BidChale. Here's how to separate an actual bargain from a lot you'll regret winning.",
        category: 'Buying Guide',
        coverImage:
            'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-19',
        readTime: '4 min read',
        content: [
            "Start with the specification tab, not the title. Every electronics lot lists its condition, and where available, a full specification breakdown in the item details. A vague title like 'Smart TV — Great Deal' means nothing without confirming screen size, resolution, and whether it's actually smart-enabled — check before you bid, not after you've won.",
            "Compare the market price to what the same item sells for new elsewhere. BidChale shows an MKT PR reference on every card specifically so you're never bidding blind — if a lot's current bid is already close to that figure, factor in that you're paying near-retail for a used item, which only makes sense if the condition badge reads New/Like New.",
            "Favor vendors and lots with pickup and shipping both marked available. It's a small detail, but it usually signals a vendor who's set up to actually fulfil the order smoothly, rather than one who listed opportunistically and may be slow to respond once you've won.",
            "Remember that every purchase, whether won by bid or Buy Now, is protected by BidChale's escrow: your payment isn't released to the vendor until you confirm the item arrived as described. If something's materially wrong, you have 48 hours from the expected delivery date to raise a dispute — so a fair deal today is also a protected one.",
        ],
    },
    {
        slug: 'vendor-guide-listings-that-sell-fast',
        title: "The Vendor's Guide to Listings That Sell Fast",
        excerpt:
            'The difference between a lot that gets buried and one that closes in a bidding war usually comes down to five minutes of extra effort at listing time.',
        category: 'Vendor Resources',
        coverImage:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-24',
        readTime: '5 min read',
        content: [
            "Photos do most of the selling before a single bid is placed. Vendors who upload multiple clear, well-lit images — including any visible wear — consistently see more early bidders than those who upload one dark photo and a wall of text. Buyers can't touch the item, so the photo set is the closest thing they have.",
            "Price your starting bid to invite competition, not to protect your margin. A starting bid that's already close to what you hope to receive tends to scare off the very bidders who'd have pushed the price higher through genuine competition. Starting lower and letting the market find the price is, counterintuitively, how most of the highest-closing lots on BidChale get there.",
            "Fill in the specification fields completely. Listings with a full specification breakdown get fewer pre-bid questions and fewer post-sale disputes — buyers know exactly what they're bidding on, which builds the kind of trust that turns into a five-star rating.",
            "Be upfront about delivery and pickup. Mark both options accurately, and if you only serve certain regions, say so in the description. Vendors who are vague here tend to see wins fall through at payment time, when the buyer discovers delivery isn't actually available to their region.",
            "Remember every listing goes through a quick review before it goes live — accurate, complete listings clear review faster and get in front of bidders sooner.",
        ],
        callout: {
            title: 'New vendor?',
            body: 'Your first few listings shape your rating more than any single sale. Start with items you know well and can describe precisely — the reviews you earn early make every listing after easier to sell.',
        },
    },
    {
        slug: 'escrow-and-safety',
        title: 'Escrow & Safety: How BidChale Protects Every Transaction',
        excerpt:
            "Every cedi you spend on BidChale passes through an escrow step before it ever reaches a vendor. Here's exactly how that protects you.",
        category: 'Platform Updates',
        coverImage:
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-27',
        readTime: '4 min read',
        content: [
            "When you win a lot or use Buy Now, your payment doesn't go straight to the vendor — it's held by BidChale in escrow. The vendor is notified to prepare the item for pickup or delivery, but the funds only move to them once you've confirmed the item arrived as described.",
            "This single step is what makes it safe to buy from a vendor you've never dealt with before. If a delivery never shows up, or the item is significantly different from its listing, you have 48 hours from the expected delivery date to raise a dispute rather than simply losing your money.",
            "For vendors, escrow works in the opposite direction: it guarantees that a winning bidder has already committed real funds before you ship or hand over an item, removing the usual risk of a buyer backing out after the fact.",
            "The system only works because both sides hold up their end — buyers paying within the 24–48 hour window after winning, and vendors preparing accurate listings and honoring pickup/delivery terms. When that happens, escrow is invisible; you only really notice it when something goes wrong and it quietly does its job.",
        ],
    },
    {
        slug: 'nationwide-delivery-explained',
        title: 'From Accra to Tamale: How Nationwide Delivery Works',
        excerpt:
            "BidChale reaches every region in Ghana — but delivery isn't one-size-fits-all. Here's what to check before you bid.",
        category: 'Platform Updates',
        coverImage:
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-06-30',
        readTime: '3 min read',
        content: [
            "BidChale itself is accessible anywhere in Ghana with an internet connection, from Accra and Kumasi to Tamale and Takoradi. What varies lot to lot is how the vendor gets the item to you — that's set individually, not platform-wide.",
            "Every lot marks whether pickup, shipping, or both are available. Some vendors offer genuine nationwide delivery; others are pickup-only from a specific location, usually because the item is large, fragile, or regionally specific like certain car parts. Always check this before bidding, not after you've won and are trying to figure out logistics.",
            "If you're bidding from outside a vendor's delivery zone, it's worth reaching out before the auction closes rather than after — a vendor who can't confirm delivery to your region in time may need you to arrange pickup instead, and that's much easier to sort out with time on the clock.",
            "Once you've won, the notification you receive includes payment and collection instructions specific to that vendor's setup, so there's no guesswork about what happens next.",
        ],
    },
    {
        slug: 'vendor-spotlight-first-listing-to-fully-booked',
        title: 'Vendor Spotlight: From First Listing to Fully Booked',
        excerpt:
            'A closer look at how one Kumasi-based vendor went from a single test listing to a steady stream of repeat bidders in a few months.',
        category: 'Success Stories',
        coverImage:
            'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1400&q=80',
        author: 'BidChale Team',
        date: '2026-07-02',
        readTime: '4 min read',
        content: [
            "Like most new vendors, this one started small: a single phone accessories lot listed mostly to see how the process worked. Clear photos, a full specification list, and an honest 'Good Condition' tag on a slightly used item — nothing flashy, just complete.",
            "That first listing sold within its window, and the buyer left a five-star rating specifically calling out how accurately the item was described. On BidChale, that kind of early trust compounds: buyers browsing a vendor's other lots can see the rating before they ever place a bid.",
            "The turning point came from treating every listing with the same care as the first — consistent photo quality, complete specifications, and clearly marked delivery options for buyers outside Kumasi. Within a few months, several lots were closing with double-digit bid counts, well above the platform average for that category.",
            "The lesson generalizes well beyond one vendor: on a platform where buyers can't inspect an item in person, consistency and accuracy do more for repeat business than any single well-priced lot ever could.",
        ],
    },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
    const current = getPostBySlug(slug)
    if (!current) return []
    const sameCategory = blogPosts.filter((post) => post.slug !== slug && post.category === current.category)
    const others = blogPosts.filter((post) => post.slug !== slug && post.category !== current.category)
    return [...sameCategory, ...others].slice(0, count)
}

export function formatBlogDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
