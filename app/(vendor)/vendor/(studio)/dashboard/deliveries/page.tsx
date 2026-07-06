import { DeliveryDispatchList } from './_components/delivery-dispatch-list'

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground text-sm">
          Customers who chose delivery are listed here. Open the Yango link on your phone to book and pay for the
          ride, then update the status as the courier makes progress — Yango doesn&apos;t report tracking back to us.
        </p>
      </div>

      <DeliveryDispatchList />
    </div>
  )
}
