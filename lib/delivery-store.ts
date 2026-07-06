'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { Coordinates, YangoQuote } from './yango'

export type FulfillmentMethod = 'pickup' | 'delivery'

/** Yango exposes no booking/tracking API — a human at the vendor always has to
 * check the actual fare in the Yango app and physically book the ride, so the
 * flow has an explicit "vendor confirms real price" step instead of pretending
 * an in-app quote is the final cost. */
export type DeliveryStatus = 'requested' | 'price_confirmed' | 'courier_en_route' | 'delivered'

export type DeliveryRecord = {
  lotId: number
  lotTitle: string
  method: FulfillmentMethod
  vendorAddressLabel?: string
  vendorCoords?: Coordinates
  customerAddressLabel?: string
  customerCoords?: Coordinates
  /** Unconfirmed ballpark from Yango's public quote endpoint, shown only as a hint. */
  estimatedQuote?: YangoQuote
  /** The real price the vendor checked in the Yango app and typed in — this is what's billed/communicated. */
  confirmedPrice?: number
  confirmedPriceCurrency?: string
  status?: DeliveryStatus
  dispatchLink?: string
  updatedAt: string
}

const STORAGE_PREFIX = 'bidnex.delivery.'
const UPDATE_EVENT = 'bidnex:delivery-updated'

function keyFor(lotId: number) {
  return `${STORAGE_PREFIX}${lotId}`
}

/** Delivery/pickup state has no backend model yet (see AuctionLot — only
 * pickupAvailable/shippingAvailable booleans exist), so this persists to
 * localStorage behind the same interface a real `/bidder/lots/:id/delivery`
 * endpoint would expose, so swapping in the API later only touches this file. */
export function getDeliveryRecord(lotId: number): DeliveryRecord | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(keyFor(lotId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as DeliveryRecord
  } catch {
    return null
  }
}

export function saveDeliveryRecord(record: DeliveryRecord) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(keyFor(record.lotId), JSON.stringify(record))
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: record }))
}

export function clearDeliveryRecord(lotId: number) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(keyFor(lotId))
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { lotId } }))
}

export function getAllDeliveryRecords(): DeliveryRecord[] {
  if (typeof window === 'undefined') return []
  const records: DeliveryRecord[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue
    try {
      records.push(JSON.parse(window.localStorage.getItem(key) ?? ''))
    } catch {
      // skip corrupt entry
    }
  }
  return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

// useSyncExternalStore requires getSnapshot to return a referentially stable
// result between real changes (an unstable reference triggers a render loop),
// so reads are cached here and only recomputed when an update event fires.
const recordCache = new Map<number, DeliveryRecord | null>()
let allCache: DeliveryRecord[] | null = null

function invalidateCaches() {
  recordCache.clear()
  allCache = null
}

function subscribe(onChange: () => void) {
  function handler() {
    invalidateCaches()
    onChange()
  }
  window.addEventListener(UPDATE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function useDeliveryRecord(lotId: number) {
  const record = useSyncExternalStore(
    subscribe,
    () => {
      if (!recordCache.has(lotId)) recordCache.set(lotId, getDeliveryRecord(lotId))
      return recordCache.get(lotId) ?? null
    },
    () => null,
  )

  const save = useCallback((next: DeliveryRecord) => saveDeliveryRecord(next), [])
  const clear = useCallback(() => clearDeliveryRecord(lotId), [lotId])

  return { record, save, clear }
}

export function useAllDeliveryRecords() {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!allCache) allCache = getAllDeliveryRecords()
      return allCache
    },
    () => [],
  )
}
