export type Coordinates = { lat: number; lng: number }

export type YangoQuote = {
  distanceKm: number
  durationMin: number
  price: number | null
  currency: string
}

const YANGO_CLID = process.env.NEXT_PUBLIC_YANGO_CLID
const YANGO_APIKEY = process.env.NEXT_PUBLIC_YANGO_APIKEY
const YANGO_REF = process.env.NEXT_PUBLIC_YANGO_REF ?? 'bidnex'

function rll(a: Coordinates, b: Coordinates) {
  return `${a.lng},${a.lat}~${b.lng},${b.lat}`
}

/** Yango has no partner API to place or track a ride on a customer's behalf —
 * only a passenger-facing quote (`taxi_info`), a coverage check (`zone_info`),
 * and a deep link that opens the Yango app pre-filled with pickup/dropoff.
 * A human (the vendor) still has to open that link and book/pay for the ride. */
export async function getZoneInfo(point: Coordinates): Promise<{ available: boolean }> {
  if (!YANGO_CLID || !YANGO_APIKEY) return { available: false }
  try {
    const url = `https://taxi-routeinfo.taxi.yandex.net/zone_info?clid=${YANGO_CLID}&apikey=${YANGO_APIKEY}&rll=${point.lng},${point.lat}`
    const res = await fetch(url)
    if (!res.ok) return { available: false }
    const json = await res.json()
    const classes = json?.classes ?? json?.tariffs ?? []
    return { available: Array.isArray(classes) && classes.length > 0 }
  } catch {
    return { available: false }
  }
}

export async function getTaxiInfo(pointA: Coordinates, pointB: Coordinates): Promise<YangoQuote | null> {
  if (!YANGO_CLID || !YANGO_APIKEY) return null
  try {
    const url = `https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=${YANGO_CLID}&apikey=${YANGO_APIKEY}&rll=${rll(pointA, pointB)}&class=econom&lang=en`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const option = json?.options?.[0]
    if (!option) return null
    return {
      distanceKm: Math.round((json.distance ?? 0) / 100) / 10,
      durationMin: Math.round((json.time ?? 0) / 60),
      price: option.price ?? null,
      currency: option.currency ?? '',
    }
  } catch {
    return null
  }
}

export function buildYangoDeepLink(pickup: Coordinates, dropoff: Coordinates): string {
  const params = new URLSearchParams({
    'start-lat': String(pickup.lat),
    'start-lon': String(pickup.lng),
    'end-lat': String(dropoff.lat),
    'end-lon': String(dropoff.lng),
    ref: YANGO_REF,
    lang: 'en',
  })
  return `https://yango.go.link/route?${params.toString()}`
}

/** Free-text address -> coordinates via OpenStreetMap Nominatim. Yango's own
 * widget takes coordinates only, and this repo has no map/geocoding SDK yet,
 * so this covers the fallback case where a customer can't share device location. */
export async function geocodeAddress(query: string): Promise<{ coords: Coordinates; label: string } | null> {
  if (!query.trim()) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const results = await res.json()
    const first = results?.[0]
    if (!first) return null
    return { coords: { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }, label: first.display_name ?? query }
  } catch {
    return null
  }
}

export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const result = await res.json()
    return result?.display_name ?? null
  } catch {
    return null
  }
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location services are not available on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Could not get your location. Please enter your address instead.')),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}
