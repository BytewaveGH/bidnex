'use client'

import { useState } from 'react'
import { ExternalLink, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAllDeliveryRecords, saveDeliveryRecord, type DeliveryRecord, type DeliveryStatus } from '@/lib/delivery-store'

const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus | null> = {
  requested: 'price_confirmed',
  price_confirmed: 'courier_en_route',
  courier_en_route: 'delivered',
  delivered: null,
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  requested: 'Awaiting price confirmation',
  price_confirmed: 'Price confirmed — ready to dispatch',
  courier_en_route: 'Courier en route',
  delivered: 'Delivered',
}

function DeliveryCard({ record }: { record: DeliveryRecord }) {
  const [priceInput, setPriceInput] = useState('')
  const nextStatus = record.status ? NEXT_STATUS[record.status] : null
  const parsedPrice = Number(priceInput)
  const isPriceValid = priceInput.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice > 0

  function confirmPrice() {
    saveDeliveryRecord({
      ...record,
      confirmedPrice: parsedPrice,
      confirmedPriceCurrency: 'GHS',
      status: 'price_confirmed',
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="rounded-[12px] border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">{record.lotTitle}</p>
          <p className="text-xs text-muted-foreground">{record.customerAddressLabel}</p>
        </div>
        <span className="text-xs font-semibold rounded-full px-3 py-1 bg-[#E4E7EC] shrink-0">
          {record.status ? STATUS_LABEL[record.status] : ''}
        </span>
      </div>

      {record.estimatedQuote && (
        <p className="text-xs text-muted-foreground">
          Unconfirmed ballpark: ~{record.estimatedQuote.distanceKm} km, ~{record.estimatedQuote.durationMin} min
          {record.estimatedQuote.price != null && ` (~${record.estimatedQuote.price} ${record.estimatedQuote.currency})`}
        </p>
      )}

      {record.status === 'requested' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Check the fare in the Yango app, then confirm the real price:</span>
        </div>
      )}

      {record.status === 'requested' ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Delivery price (GHS)"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="h-8 max-w-[180px]"
          />
          <Button size="sm" disabled={!isPriceValid} onClick={confirmPrice}>
            Confirm Price
          </Button>
        </div>
      ) : record.confirmedPrice != null ? (
        <p className="text-sm font-semibold">Confirmed price: {record.confirmedPrice} {record.confirmedPriceCurrency}</p>
      ) : null}

      {record.status !== 'requested' && (
        <div className="flex items-center gap-2">
          {record.dispatchLink && (
            <a href={record.dispatchLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Truck className="w-4 h-4 mr-1" /> Open in Yango <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </a>
          )}
          {nextStatus && (
            <Button
              size="sm"
              onClick={() => saveDeliveryRecord({ ...record, status: nextStatus, updatedAt: new Date().toISOString() })}
            >
              Mark as {STATUS_LABEL[nextStatus]}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function DeliveryDispatchList() {
  const records = useAllDeliveryRecords().filter((r) => r.method === 'delivery' && r.status)

  if (records.length === 0) {
    return (
      <div className="rounded-[12px] border p-8 text-center text-sm text-muted-foreground">
        No deliveries requested yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => (
        <DeliveryCard key={record.lotId} record={record} />
      ))}
    </div>
  )
}
