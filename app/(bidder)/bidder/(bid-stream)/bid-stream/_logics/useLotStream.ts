'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUnauthenticatedAxios } from '@/hooks/use-axios'
import { buildStreamParams, type StreamApiResponse, type StreamFilters, type StreamLot } from './stream-types'

const PAGE_SIZE = 8

export type StreamStatus = 'loading' | 'error' | 'ready'

export function useLotStream() {
  const callApi = useUnauthenticatedAxios()

  const [lots, setLots] = useState<StreamLot[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isExhausted, setIsExhausted] = useState(false)
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StreamFilters>({ buyNow: false, categoryId: null })
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set())

  const filtersRef = useRef(filters)
  filtersRef.current = filters
  const requestIdRef = useRef(0)

  // `useUnauthenticatedAxios()` returns a new function every render, which
  // would otherwise make `fetchPage`/`maybeFetchMore` churn identity (and
  // re-fire effects that depend on them) on every unrelated re-render.
  const callApiRef = useRef(callApi)
  useEffect(() => {
    callApiRef.current = callApi
  })

  // Keyset pagination: `cursor` is the id of the last lot from the previous
  // page. The endpoint doesn't echo back an explicit `nextCursor` — it's
  // derived from the last item actually returned. "Exhausted" is inferred
  // from getting fewer rows than `limit`, since `count` has been observed
  // to be unreliable (e.g. reporting 0 while still returning rows).
  const nextCursorRef = useRef<number | null>(null)
  const hasMoreRef = useRef(true)

  const fetchPage = useCallback(
    async (mode: 'reset' | 'append') => {
      const requestId = ++requestIdRef.current
      if (mode === 'reset') {
        setStatus('loading')
        setError(null)
      } else {
        setIsFetchingMore(true)
      }

      const cursor = mode === 'reset' ? null : nextCursorRef.current
      const params = buildStreamParams({ cursor, limit: PAGE_SIZE, ...filtersRef.current })

      try {
        const res: any = await callApiRef.current({ method: 'GET', url: '/public/lots/stream', params })

        if (requestId !== requestIdRef.current) return

        if (res.status >= 400) {
          const message = res.data?.error ?? res.data?.message ?? 'Could not load the stream.'
          if (mode === 'reset') {
            setError(message)
            setStatus('error')
          }
          return
        }

        const body = res.data as StreamApiResponse
        const page = body.data
        const lastId = page.data.length > 0 ? page.data[page.data.length - 1].id : null

        // Prefer an explicit nextCursor if the backend ever starts sending one.
        const nextCursor = page.nextCursor !== undefined ? page.nextCursor : lastId
        nextCursorRef.current = nextCursor
        hasMoreRef.current = nextCursor !== null && page.data.length >= PAGE_SIZE

        setLots(prev => (mode === 'reset' ? page.data : [...prev, ...page.data]))
        setIsExhausted(!hasMoreRef.current)
        setStatus('ready')
      } catch {
        if (requestId !== requestIdRef.current) return
        if (mode === 'reset') {
          setError('Could not load — check your connection and try again.')
          setStatus('error')
        }
      } finally {
        if (requestId === requestIdRef.current) setIsFetchingMore(false)
      }
    },
    [],
  )

  // Initial load, and any time the filters change — reset and refetch from the front.
  useEffect(() => {
    nextCursorRef.current = null
    hasMoreRef.current = true
    setLots([])
    setCurrentIndex(0)
    setIsExhausted(false)
    void fetchPage('reset')
    // fetchPage is stable; filters are read via filtersRef inside it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.buyNow, filters.categoryId])

  const maybeFetchMore = useCallback(() => {
    if (isFetchingMore || isExhausted || status !== 'ready') return
    if (!hasMoreRef.current) return
    void fetchPage('append')
  }, [fetchPage, isFetchingMore, isExhausted, status])

  const restart = useCallback(() => {
    nextCursorRef.current = null
    hasMoreRef.current = true
    setLots([])
    setCurrentIndex(0)
    setIsExhausted(false)
    void fetchPage('reset')
  }, [fetchPage])

  const setFilterValue = useCallback((next: Partial<StreamFilters>) => {
    setFilters(prev => ({ ...prev, ...next }))
  }, [])

  const patchLot = useCallback((lotId: number, patch: Partial<StreamLot>) => {
    setLots(prev => prev.map(l => (l.id === lotId ? { ...l, ...patch } : l)))
  }, [])

  const setWatched = useCallback((lotId: number, watched: boolean) => {
    setWatchedIds(prev => {
      const next = new Set(prev)
      if (watched) next.add(lotId)
      else next.delete(lotId)
      return next
    })
  }, [])

  const seedWatchedIds = useCallback((ids: Iterable<number>) => {
    setWatchedIds(prev => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [])

  // Used by the "return to this lot after login" flow — puts a fetched lot at
  // the front of the feed so it's the first card the bidder lands back on.
  const insertLotFirst = useCallback((lot: StreamLot) => {
    setLots(prev => [lot, ...prev.filter(l => l.id !== lot.id)])
    setCurrentIndex(0)
  }, [])

  return {
    lots,
    currentIndex,
    setCurrentIndex,
    isFetchingMore,
    isExhausted,
    status,
    error,
    filters,
    setFilterValue,
    watchedIds,
    setWatched,
    seedWatchedIds,
    patchLot,
    insertLotFirst,
    maybeFetchMore,
    restart,
  }
}
