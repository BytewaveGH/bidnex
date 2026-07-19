export type StreamLotImage = {
  id: number
  url: string
  mediaType: 'image' | 'video'
  isPrimary: boolean
  displayOrder?: number
}

export type StreamLotCategory = {
  id: number
  name: string
}

export type StreamLotStatus = 'pending' | 'active' | 'ended' | 'sold' | 'unsold' | 'cancelled'

export type StreamLot = {
  id: number
  title: string
  description: string
  condition: string
  msrp?: number
  startingBid: number
  currentBid: number
  bidIncrement?: number
  bidCount: number
  buyNowPrice?: number | null
  bidEndTime: string | null
  status: StreamLotStatus
  primaryImage: string
  images: StreamLotImage[]
  category?: StreamLotCategory | null
  winnerId?: number | null
  bidderIds: number[]
  auctionId?: number | null
}

export type StreamPage = {
  limit: number
  // The live endpoint doesn't echo this back — useLotStream derives the
  // next cursor from the last item in `data` instead. Kept optional so an
  // explicit nextCursor is used if the backend ever starts sending one.
  nextCursor?: number | null
  count?: number
  page?: number
  data: StreamLot[]
}

export type StreamApiResponse = {
  status: boolean
  data: StreamPage
}

export type StreamFilters = {
  buyNow: boolean
  categoryId: number | null
}

export function resolveStreamMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}/${path.replace(/^\//, '')}`
}

export type StreamMediaItem = {
  id: number
  url: string
  type: 'image' | 'video'
}

/** All of a lot's media for the in-card swipeable carousel, in the order
 * the stream endpoint returns them — BidStream is video-first by design,
 * so this deliberately does not re-sort (no per-card sort pass over
 * `images` on every render). Falls back to `primaryImage` alone when the
 * lot has no `images` entries. */
export function streamMediaItems(lot: StreamLot): StreamMediaItem[] {
  if (lot.images && lot.images.length > 0) {
    return lot.images
      .map((img) => ({ id: img.id, url: resolveStreamMediaUrl(img.url) ?? '', type: img.mediaType }))
      .filter((item) => item.url)
  }
  const fallback = resolveStreamMediaUrl(lot.primaryImage)
  if (!fallback) return []
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(fallback)
  return [{ id: -1, url: fallback, type: isVideo ? 'video' : 'image' }]
}

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function deriveLotStanding(lot: StreamLot, currentUserId: number): { isWinning: boolean; isOutbid: boolean; isWon: boolean } {
  const isWon = lot.status === 'sold' && lot.winnerId === currentUserId
  const isWinning = !isWon && lot.winnerId === currentUserId
  const isOutbid = !isWon && !isWinning && lot.bidderIds.includes(currentUserId)
  return { isWinning, isOutbid, isWon }
}

export function minNextBid(lot: StreamLot): number {
  const increment = lot.bidIncrement && lot.bidIncrement > 0 ? lot.bidIncrement : 1
  if (lot.bidCount === 0) return lot.startingBid && lot.startingBid > 0 ? lot.startingBid : increment
  return lot.currentBid + increment
}

/** Renders a duration from its largest nonzero unit down through seconds,
 * so the countdown always ticks visibly regardless of how far out the end
 * time is (e.g. "2w 3d 05h 12m 08s", not a truncated "2w 3d"). */
function formatDurationLabel(ms: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const totalSeconds = Math.floor(ms / 1000)

  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const days = totalDays % 7
  const totalWeeks = Math.floor(totalDays / 7)

  if (totalWeeks > 0) return `${totalWeeks}w ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
  if (totalDays > 0) return `${totalDays}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
  if (totalHours > 0) return `${totalHours}h ${pad(minutes)}m ${pad(seconds)}s`
  if (totalMinutes > 0) return `${totalMinutes}m ${pad(seconds)}s`
  return `${seconds}s`
}

export function formatStreamCountdown(bidEndTime: string | null): { label: string; urgent: boolean; ended: boolean } {
  if (!bidEndTime) return { label: '', urgent: false, ended: false }
  const diff = new Date(bidEndTime).getTime() - Date.now()
  if (diff <= 0) return { label: 'Ended', urgent: false, ended: true }

  const urgent = diff < 5 * 60 * 1000
  return { label: formatDurationLabel(diff), urgent, ended: false }
}

export function buildStreamParams(params: {
  cursor?: number | null
  limit?: number
  buyNow?: boolean
  categoryId?: number | null
}): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {}
  if (params.cursor !== undefined && params.cursor !== null) query.cursor = params.cursor
  if (params.limit !== undefined) query.limit = params.limit
  if (params.buyNow) query.buyNow = true
  if (params.categoryId !== undefined && params.categoryId !== null) query.categoryId = params.categoryId
  return query
}
