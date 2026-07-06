import { Suspense } from 'react'
import BidStream from './_widgets/bid-stream'

export default function BidStreamPage() {
  return (
    <Suspense>
      <BidStream />
    </Suspense>
  )
}
