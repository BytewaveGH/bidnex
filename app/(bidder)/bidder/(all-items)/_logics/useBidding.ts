'use client'

import { useState } from 'react'
import { useAxios } from '@/hooks/use-axios'

type LotBidState = { loading: boolean; error: string | null }

export function useBidding() {
  const callApi = useAxios()
  const [states, setStates] = useState<Map<number, LotBidState>>(new Map())

  function getState(lotId: number): LotBidState {
    return states.get(lotId) ?? { loading: false, error: null }
  }

  function clearError(lotId: number) {
    setStates(prev => {
      const next = new Map(prev)
      next.set(lotId, { ...(next.get(lotId) ?? { loading: false, error: null }), error: null })
      return next
    })
  }

  async function placeBid(lotId: number, amount: number): Promise<boolean> {
    setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: true, error: null }); return n })
    try {
      const res = await callApi({ method: 'POST', url: `/bidder/lots/${lotId}/bids`, data: { amount } }) as any
      if (res.status === 201 || res.status === 200) {
        setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: null }); return n })
        return true
      }
      const err: string = res.data?.error ?? res.data?.message ?? 'Failed to place bid.'
      setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: err }); return n })
      return false
    } catch {
      setStates(prev => { const n = new Map(prev); n.set(lotId, { loading: false, error: 'Network error. Please try again.' }); return n })
      return false
    }
  }

  return { placeBid, getState, clearError }
}
