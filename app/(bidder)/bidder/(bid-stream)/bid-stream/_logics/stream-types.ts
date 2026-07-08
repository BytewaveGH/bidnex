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

export function minNextBid(lot: StreamLot): number {
  if (lot.bidCount === 0) return lot.startingBid
  const increment = lot.bidIncrement && lot.bidIncrement > 0 ? lot.bidIncrement : 1
  return lot.currentBid + increment
}

export function formatStreamCountdown(bidEndTime: string | null): { label: string; urgent: boolean; ended: boolean } {
  if (!bidEndTime) return { label: '', urgent: false, ended: false }
  const diff = new Date(bidEndTime).getTime() - Date.now()
  if (diff <= 0) return { label: 'Ended', urgent: false, ended: true }

  const urgent = diff < 5 * 60 * 1000
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')

  let label: string
  if (hours > 0) label = `${hours}h ${paddedMinutes}m ${paddedSeconds}s`
  else if (minutes > 0) label = `${minutes}m ${paddedSeconds}s`
  else label = `${paddedSeconds}s`

  return { label, urgent, ended: false }
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
