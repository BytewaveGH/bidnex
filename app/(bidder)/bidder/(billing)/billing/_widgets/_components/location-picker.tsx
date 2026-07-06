'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { LocateFixed, Loader2, Search } from 'lucide-react'
import { geocodeAddress, getCurrentPosition, reverseGeocode, type Coordinates } from '@/lib/yango'

export type PickedLocation = { coords: Coordinates; label: string }

type LocationPickerProps = {
  value: PickedLocation | null
  onChange: (value: PickedLocation) => void
}

// Accra — sensible default center until the customer searches or shares their location.
const DEFAULT_CENTER: Coordinates = { lat: 5.6037, lng: -0.187 }

function pinIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#0A0A0B;border:2px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  })
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const center = value?.coords ?? DEFAULT_CENTER

    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [center.lat, center.lng],
      value ? 15 : 12,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    const marker = L.marker([center.lat, center.lng], { icon: pinIcon(), draggable: true }).addTo(map)

    async function commit(coords: Coordinates, label?: string) {
      const finalLabel = label ?? (await reverseGeocode(coords)) ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      onChangeRef.current({ coords, label: finalLabel })
    }

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      void commit({ lat: pos.lat, lng: pos.lng })
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng)
      void commit({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Map is initialized once; subsequent coordinate changes are driven imperatively via handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleUseMyLocation() {
    setIsLocating(true)
    setSearchError(null)
    try {
      const coords = await getCurrentPosition()
      mapRef.current?.setView([coords.lat, coords.lng], 15)
      markerRef.current?.setLatLng([coords.lat, coords.lng])
      const label = (await reverseGeocode(coords)) ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      onChangeRef.current({ coords, label })
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Could not get your location.')
    } finally {
      setIsLocating(false)
    }
  }

  async function handleSearch() {
    if (!query.trim()) return
    setIsSearching(true)
    setSearchError(null)
    try {
      const result = await geocodeAddress(query)
      if (!result) {
        setSearchError("Couldn't find that address. Try being more specific.")
        return
      }
      mapRef.current?.setView([result.coords.lat, result.coords.lng], 16)
      markerRef.current?.setLatLng([result.coords.lat, result.coords.lng])
      onChangeRef.current(result)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#98A2B3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSearch() } }}
            placeholder="Search for your address"
            className="w-full h-10 pl-9 pr-3 rounded-[10px] border border-[#E4E7EC] text-sm placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#344054]/20"
          />
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          title="Use my current location"
          className="h-10 w-10 shrink-0 rounded-[10px] border border-[#E4E7EC] flex items-center justify-center hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {isLocating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4 text-[#344054]" />}
        </button>
      </div>

      {searchError && <p className="text-xs text-[#D42620]">{searchError}</p>}

      <div className="relative rounded-[14px] overflow-hidden border border-[#E4E7EC]">
        <div ref={containerRef} className="h-[180px] w-full" />
        {isSearching && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Loader2 className="size-5 animate-spin text-[#344054]" />
          </div>
        )}
        <span className="absolute bottom-1 right-1.5 text-[9px] text-[#98A2B3] bg-white/70 px-1 rounded">
          © OpenStreetMap
        </span>
      </div>

      {value && (
        <p className="text-xs text-[#657688] line-clamp-2">
          <span className="font-medium text-[#344054]">Pin: </span>{value.label}
        </p>
      )}
      <p className="text-[11px] text-[#98A2B3]">Drag the pin or tap the map to fine-tune the exact spot.</p>
    </div>
  )
}
