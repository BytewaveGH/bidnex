'use client'

import { useCallback, useState } from 'react'
import { useAxios } from '@/hooks/use-axios'

type LotMaxBidState = { loading: boolean; error: string | null }

const EMPTY_MAX_BID_STATE: LotMaxBidState = { loading: false, error: null }

export function useMaxBidding() {
  const callApi = useAxios()
  const [states, setStates] = useState<Map<number, LotMaxBidState>>(new Map())

  const getState = useCallback((lotId: number): LotMaxBidState => {
    return states.get(lotId) ?? EMPTY_MAX_BID_STATE
  }, [states])

  const clearError = useCallback((lotId: number) => {
    setStates(prev => {
      const next = new Map(prev)
      next.set(lotId, { ...(next.get(lotId) ?? EMPTY_MAX_BID_STATE), error: null })
      return next
    })
  }, [])

  const setMaxBid = useCallback(async (lotId: number, amount: number): Promise<boolean> => {
    setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: true, error: null }); return n })
    try {
      const res = await callApi({ method: 'POST', url: `/bidder/lots/${lotId}/max-bid`, data: { MaxAmount: amount } }) as any
      if (res.status === 200 || res.status === 201) {
        setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: null }); return n })
        return true
      }
      const err: string = res.data?.error ?? res.data?.message ?? 'Failed to set max bid.'
      setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: err }); return n })
      return false
    } catch {
      setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: 'Network error. Please try again.' }); return n })
      return false
    }
  }, [callApi])

  return { setMaxBid, getState, clearError }
}
