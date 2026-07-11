'use client'

import { useCallback, useState } from 'react'
import { useAxios } from '@/hooks/use-axios'

export type ActionResult = { ok: boolean; status?: number; error?: string }

type LotActionState = { loading: boolean; error: string | null }
const IDLE: LotActionState = { loading: false, error: null }

function extractError(res: { data?: { error?: string; message?: string } }, fallback: string): string {
  return res?.data?.error ?? res?.data?.message ?? fallback
}

export function useStreamActions() {
  const callApi = useAxios()
  const [bidStates, setBidStates] = useState<Map<number, LotActionState>>(new Map())
  const [buyNowStates, setBuyNowStates] = useState<Map<number, LotActionState>>(new Map())
  const [maxBidStates, setMaxBidStates] = useState<Map<number, LotActionState>>(new Map())
  const [watchPending, setWatchPending] = useState<Set<number>>(new Set())

  const getBidState = useCallback((lotId: number) => bidStates.get(lotId) ?? IDLE, [bidStates])
  const getBuyNowState = useCallback((lotId: number) => buyNowStates.get(lotId) ?? IDLE, [buyNowStates])
  const getMaxBidState = useCallback((lotId: number) => maxBidStates.get(lotId) ?? IDLE, [maxBidStates])

  const clearBidError = useCallback((lotId: number) => {
    setBidStates(prev => {
      const next = new Map(prev)
      next.set(lotId, { ...(next.get(lotId) ?? IDLE), error: null })
      return next
    })
  }, [])

  const clearMaxBidError = useCallback((lotId: number) => {
    setMaxBidStates(prev => {
      const next = new Map(prev)
      next.set(lotId, { ...(next.get(lotId) ?? IDLE), error: null })
      return next
    })
  }, [])

  const placeBid = useCallback(
    async (lotId: number, amount: number): Promise<ActionResult> => {
      setBidStates(prev => new Map(prev).set(lotId, { loading: true, error: null }))
      try {
        const res: any = await callApi({ method: 'POST', url: `/bidder/lots/${lotId}/bids`, data: { amount } })
        if (res.status >= 400) {
          const error = extractError(res, 'Failed to place bid.')
          setBidStates(prev => new Map(prev).set(lotId, { loading: false, error }))
          return { ok: false, status: res.status, error }
        }
        setBidStates(prev => new Map(prev).set(lotId, { loading: false, error: null }))
        return { ok: true, status: res.status }
      } catch {
        const error = 'Network error. Please try again.'
        setBidStates(prev => new Map(prev).set(lotId, { loading: false, error }))
        return { ok: false, error }
      }
    },
    [callApi],
  )

  const buyNow = useCallback(
    async (lotId: number): Promise<ActionResult> => {
      setBuyNowStates(prev => new Map(prev).set(lotId, { loading: true, error: null }))
      try {
        const res: any = await callApi({ method: 'POST', url: `/bidder/lots/${lotId}/buy-now` })
        if (res.status >= 400) {
          const error = extractError(res, 'Failed to complete purchase.')
          setBuyNowStates(prev => new Map(prev).set(lotId, { loading: false, error }))
          return { ok: false, status: res.status, error }
        }
        setBuyNowStates(prev => new Map(prev).set(lotId, { loading: false, error: null }))
        return { ok: true, status: res.status }
      } catch {
        const error = 'Network error. Please try again.'
        setBuyNowStates(prev => new Map(prev).set(lotId, { loading: false, error }))
        return { ok: false, error }
      }
    },
    [callApi],
  )

  // No max-bid endpoint is documented for BidStream — this mirrors the
  // existing app-wide proxy-bid endpoint (see useMaxBidding.ts) so the
  // feature behaves identically everywhere in the app.
  const setMaxBid = useCallback(
    async (lotId: number, amount: number): Promise<ActionResult> => {
      setMaxBidStates(prev => new Map(prev).set(lotId, { loading: true, error: null }))
      try {
        const res: any = await callApi({ method: 'POST', url: `/bidder/lots/${lotId}/max-bid`, data: { MaxAmount: amount } })
        if (res.status >= 400) {
          const error = extractError(res, 'Failed to set max bid.')
          setMaxBidStates(prev => new Map(prev).set(lotId, { loading: false, error }))
          return { ok: false, status: res.status, error }
        }
        setMaxBidStates(prev => new Map(prev).set(lotId, { loading: false, error: null }))
        return { ok: true, status: res.status }
      } catch {
        const error = 'Network error. Please try again.'
        setMaxBidStates(prev => new Map(prev).set(lotId, { loading: false, error }))
        return { ok: false, error }
      }
    },
    [callApi],
  )

  const isWatchPending = useCallback((lotId: number) => watchPending.has(lotId), [watchPending])

  const setWatch = useCallback(
    async (lotId: number, watch: boolean): Promise<ActionResult> => {
      setWatchPending(prev => new Set(prev).add(lotId))
      try {
        const res: any = watch
          ? await callApi({ method: 'POST', url: `/bidder/watchlist/${lotId}` })
          : await callApi({ method: 'DELETE', url: `/bidder/watchlist/${lotId}` })

        if (res.status >= 400) {
          const error = extractError(res, watch ? 'Failed to add to watchlist.' : 'Failed to remove from watchlist.')
          return { ok: false, status: res.status, error }
        }
        return { ok: true, status: res.status }
      } catch {
        return { ok: false, error: 'Network error. Please try again.' }
      } finally {
        setWatchPending(prev => {
          const next = new Set(prev)
          next.delete(lotId)
          return next
        })
      }
    },
    [callApi],
  )

  return {
    placeBid,
    getBidState,
    clearBidError,
    buyNow,
    getBuyNowState,
    setMaxBid,
    getMaxBidState,
    clearMaxBidError,
    setWatch,
    isWatchPending,
  }
}
