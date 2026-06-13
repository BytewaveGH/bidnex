'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAxios } from '@/hooks/use-axios'
import { showToast } from '@/components/templates/toast-template'

type WatchlistContextType = {
  watchlistIds: Set<number>
  pendingIds: Set<number>
  count: number
  toggleWatchlist: (lotId: number) => Promise<void>
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const callApi = useAxios()
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (session?.user?.userType !== 'bidder') return
    callApi({ method: 'GET', url: '/bidder/watchlist', params: { limit: 1000 } })
      .then((res: any) => {
        const page = res.data?.data
        const ids: number[] = page?.data?.map((item: any) => item.lotId) ?? []
        setWatchlistIds(new Set(ids))
        setCount(page?.count ?? 0)
      })
      .catch(() => {})
  }, [!!session?.user])

  async function toggleWatchlist(lotId: number) {
    if (pendingIds.has(lotId)) return
    const inWatchlist = watchlistIds.has(lotId)
    setPendingIds(prev => new Set(prev).add(lotId))
    try {
      if (inWatchlist) {
        const res = await callApi({ method: 'DELETE', url: `/bidder/watchlist/${lotId}` }) as any
        if (res.status >= 400) throw new Error()
        setWatchlistIds(prev => { const n = new Set(prev); n.delete(lotId); return n })
        setCount(prev => Math.max(0, prev - 1))
        showToast('success', 'Item removed from your watchlist.')
      } else {
        const res = await callApi({ method: 'POST', url: `/bidder/watchlist/${lotId}` }) as any
        if (res.status >= 400) throw new Error()
        setWatchlistIds(prev => new Set(prev).add(lotId))
        setCount(prev => prev + 1)
        showToast('success', 'Item added to your watchlist.')
      }
    } catch {
      showToast('failure', inWatchlist ? 'Failed to remove item.' : 'Failed to add item.')
    } finally {
      setPendingIds(prev => { const n = new Set(prev); n.delete(lotId); return n })
    }
  }

  return (
    <WatchlistContext.Provider value={{ watchlistIds, pendingIds, count, toggleWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlistIds() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlistIds must be used inside WatchlistProvider')
  return ctx
}
