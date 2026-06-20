# Vendor Dashboard — Backend API Requirements

This document outlines the API endpoints the vendor dashboard needs.
All endpoints are scoped to the authenticated vendor. The vendor's identity is resolved from the session/JWT — no vendor ID in the URL is needed.

---

## Authentication

All endpoints require a valid vendor session token in the `Authorization: Bearer <token>` header.

---

## 1. Dashboard KPI Stats

Returns the four headline metrics shown in the top KPI cards.

**GET** `/api/vendor/dashboard/stats`

### Response
```json
{
  "totalAuctionRevenue": {
    "value": 184200,
    "previousPeriod": 164800,
    "changePercent": 12.0
  },
  "bidWinRate": {
    "value": 63.2,
    "previousPeriod": 66.3,
    "changePercent": -3.1
  },
  "activeAuctions": {
    "value": 18,
    "previousPeriod": 13,
    "changeAbsolute": 5
  },
  "avgBidsPerLot": {
    "value": 7.4,
    "previousPeriod": 6.5,
    "changeAbsolute": 0.9
  }
}
```

### Notes
- `previousPeriod` is always the previous calendar month.
- `changePercent` is a signed float (negative = decrease).
- `changeAbsolute` is used when a percentage change isn't meaningful (counts, averages).

---

## 2. Bid Activity Chart

Returns monthly bid counts for the bar chart. Supports time range filtering.

**GET** `/api/vendor/dashboard/bid-activity?range=last-12-months`

### Query Params

| Param  | Values                                      | Default           |
|--------|---------------------------------------------|-------------------|
| `range`| `last-30-days` \| `last-quarter` \| `last-12-months` | `last-12-months` |

### Response
```json
{
  "range": "last-12-months",
  "data": [
    { "date": "2025-07-01T00:00:00.000Z", "bids": 28 },
    { "date": "2025-08-01T00:00:00.000Z", "bids": 34 },
    { "date": "2025-09-01T00:00:00.000Z", "bids": 29 },
    { "date": "2025-10-01T00:00:00.000Z", "bids": 41 },
    { "date": "2025-11-01T00:00:00.000Z", "bids": 38 },
    { "date": "2025-12-01T00:00:00.000Z", "bids": 47 },
    { "date": "2026-01-01T00:00:00.000Z", "bids": 52 },
    { "date": "2026-02-01T00:00:00.000Z", "bids": 44 },
    { "date": "2026-03-01T00:00:00.000Z", "bids": 61 },
    { "date": "2026-04-01T00:00:00.000Z", "bids": 55 },
    { "date": "2026-05-01T00:00:00.000Z", "bids": 49 },
    { "date": "2026-06-01T00:00:00.000Z", "bids": 57 }
  ],
  "summary": {
    "totalBids": 535,
    "auctionsClosed": 248,
    "closeRate": 46
  }
}
```

### Notes
- For `last-30-days`: return daily data points (30 items).
- For `last-quarter`: return weekly data points (~13 items).
- For `last-12-months`: return monthly data points (12 items).
- `closeRate` is `round((auctionsClosed / totalBids) * 100)`.

---

## 3. Today's Tasks

Returns the vendor's task list for the current day.

**GET** `/api/vendor/tasks?date=today&limit=5`

### Response
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Review bids on Lot #AU-0421 before closing",
      "tag": "Auction",
      "dueTime": "10:00",
      "completed": false
    },
    {
      "id": "task-002",
      "title": "Respond to dispute raised on Lot #AU-0398",
      "tag": "Dispute",
      "dueTime": "11:30",
      "completed": true
    }
  ]
}
```

### Notes
- `tag` is one of: `"Auction"`, `"Dispute"`, `"Listing"`, `"Pricing"`, `"Finance"`, `"Admin"`.
- `dueTime` is a 24-hour time string `"HH:mm"`.

**PATCH** `/api/vendor/tasks/:taskId`

Mark a task as complete/incomplete.

```json
{ "completed": true }
```

---

## 4. Upcoming Auctions (Today's Schedule)

Returns the vendor's auction schedule for today — used in the sidebar widget.

**GET** `/api/vendor/auctions/today?limit=5`

### Response
```json
{
  "auctions": [
    {
      "id": "AU-0421",
      "title": "Vintage Rolex Daytona Set",
      "lotNumber": "AU-0421",
      "status": "Live",
      "scheduledTime": "2026-06-20T10:00:00.000Z",
      "timeLabel": "Closes 10:00 AM",
      "bidCount": 14,
      "startingPrice": 2400,
      "currency": "USD"
    },
    {
      "id": "AU-0422",
      "title": "1967 Ford Mustang Fastback",
      "lotNumber": "AU-0422",
      "status": "Scheduled",
      "scheduledTime": "2026-06-20T12:00:00.000Z",
      "timeLabel": "Starts 12:00 PM",
      "bidCount": 0,
      "startingPrice": 18000,
      "currency": "USD"
    }
  ]
}
```

### Status values

| Value        | Meaning                              | Badge color |
|--------------|--------------------------------------|-------------|
| `Live`       | Auction is currently accepting bids  | Green       |
| `Scheduled`  | Starts later today or in future      | Yellow      |
| `Withdrawn`  | Cancelled or pulled by vendor        | Red         |
| `Ended`      | Auction closed, awaiting settlement  | Grey        |

---

## 5. Submitted Lots Table

Returns paginated lots for the vendor's lot management table.

**GET** `/api/vendor/lots`

### Query Params

| Param      | Type    | Default | Description                              |
|------------|---------|---------|------------------------------------------|
| `page`     | integer | `1`     | Page number (1-indexed)                  |
| `limit`    | integer | `10`    | Items per page                           |
| `search`   | string  | —       | Free-text search on lot title or ID      |
| `status`   | string  | —       | Filter: `Live`, `Scheduled`, `Ended`, `Draft` |
| `activity` | string  | —       | Filter: `Active`, `Expiring Soon`, `No Bids`, `Withdrawn` |

### Response
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "lots": [
    {
      "id": "AU-0421",
      "title": "Vintage Rolex Daytona Set",
      "status": "Live",
      "bids": 14,
      "activity": "Active",
      "currentBid": 4800,
      "currency": "USD",
      "closingAt": "2026-06-20T10:00:00.000Z"
    },
    {
      "id": "AU-0420",
      "title": "1967 Ford Mustang Fastback",
      "status": "Live",
      "bids": 8,
      "activity": "Active",
      "currentBid": 22500,
      "currency": "USD",
      "closingAt": "2026-06-21T14:00:00.000Z"
    }
  ]
}
```

### Activity values

| Value           | Meaning                                    | Strip score (out of 18) |
|-----------------|--------------------------------------------|-------------------------|
| `Active`        | Receiving bids normally                    | 18                      |
| `Expiring Soon` | Closing within the next 2 hours            | 11                      |
| `No Bids`       | Live/Scheduled but no bids yet             | 7                       |
| `Withdrawn`     | Pulled or cancelled                        | 4                       |

### Notes
- `currentBid` returns `null` if no bids have been placed yet (show starting price on frontend).
- Prices are integers in the base currency unit (cents or whole units — agree on convention).
- `closingAt` is ISO 8601 UTC.

---

## 6. Disputes (Today's Tasks panel)

> Used in the disputes section / tasks panel. If disputes are surfaced in the task list (tag = `"Dispute"`), a separate endpoint may not be needed. Include if you want a dedicated disputes widget later.

**GET** `/api/vendor/disputes?status=open&limit=5`

### Response
```json
{
  "disputes": [
    {
      "id": "DIS-0041",
      "lotId": "AU-0398",
      "lotTitle": "Vintage Fender Stratocaster (1959)",
      "reason": "Item not as described",
      "status": "Open",
      "openedAt": "2026-06-18T09:12:00.000Z",
      "respondByAt": "2026-06-22T09:12:00.000Z"
    }
  ]
}
```

---

## 7. Lots Overview Page Stats

Returns the six KPI cards shown at the top of the `/dashboard/lots` page.

**GET** `/api/vendor/lots/stats`

### Response
```json
{
  "auctionRevenue": {
    "value": 184200,
    "previousPeriod": 159000,
    "changePercent": 15.8,
    "currency": "GHS"
  },
  "lotsSubmitted": {
    "value": 24,
    "previousPeriod": 18,
    "changeAbsolute": 6
  },
  "uniqueBidders": {
    "value": 312,
    "previousPeriod": 277,
    "changePercent": 12.5
  },
  "avgReservePrice": {
    "value": 850,
    "previousPeriod": 890,
    "changeAbsolute": -40,
    "currency": "GHS"
  },
  "openDisputes": {
    "value": 3,
    "previousPeriod": 1,
    "changeAbsolute": 2
  },
  "approvalRate": {
    "value": 89,
    "previousPeriod": 85.8,
    "changePoints": 3.2
  }
}
```

### Notes
- `changePercent` is a signed float.
- `changeAbsolute` is used for counts and currency amounts where a percentage isn't meaningful.
- `changePoints` is used for percentage-point metrics (approval rate).
- `currency` is only present on monetary fields.
- All monetary values are in the base currency unit (whole GHS, not pesewas).

---

## 8. Lot Status Breakdown

Returns the gauge chart data for the Lot Status widget.

**GET** `/api/vendor/lots/status-summary`

### Response
```json
{
  "active": 18,
  "pendingReview": 9,
  "ended": 5,
  "total": 32
}
```

---

## 9. Top Performing Lots

Returns the top 3 lots by revenue for the vendor's dashboard widget.

**GET** `/api/vendor/lots/top?limit=3`

### Response
```json
{
  "revenueShare": 73,
  "categories": [
    { "name": "Watches", "share": 44 },
    { "name": "Collectibles", "share": 32 },
    { "name": "Vehicles", "share": 24 }
  ],
  "lots": [
    {
      "id": "AU-0421",
      "title": "Vintage Rolex Daytona Set",
      "category": "Watches",
      "revenueShare": "31%",
      "topBid": 4800,
      "currency": "GHS"
    },
    {
      "id": "AU-0415",
      "title": "Signed Muhammad Ali Gloves",
      "category": "Collectibles",
      "revenueShare": "24%",
      "topBid": 8400,
      "currency": "GHS"
    },
    {
      "id": "AU-0420",
      "title": "1967 Ford Mustang Fastback",
      "category": "Vehicles",
      "revenueShare": "18%",
      "topBid": 22500,
      "currency": "GHS"
    }
  ]
}
```

---

## 10. Seller Feedback

Returns the vendor's rating and a sample of recent buyer feedback.

**GET** `/api/vendor/feedback?limit=1`

### Response
```json
{
  "averageRating": 4.8,
  "totalReviews": 284,
  "latestReview": {
    "id": "rev-0091",
    "buyerName": "Emmanuel Owusu",
    "rating": 5,
    "comment": "Item was exactly as described. Packed very well and delivered on time — would bid from this seller again.",
    "createdAt": "2026-06-15T11:24:00.000Z"
  }
}
```

---

## 11. Vendor Finance KPIs

Returns the four headline metrics on the Vendor Finances page.

**GET** `/api/vendor/finance/stats`

### Response
```json
{
  "totalEarnings": {
    "value": 184200,
    "previousPeriod": 164800,
    "changePercent": 8.4,
    "currency": "GHS"
  },
  "availableToWithdraw": {
    "value": 18400,
    "thirtyDayAverage": 16300,
    "changePercent": 3.2,
    "currency": "GHS"
  },
  "subscription": {
    "planName": "Premium",
    "billingCycle": "monthly",
    "amount": 299,
    "currency": "GHS",
    "renewsAt": "2026-07-20T00:00:00Z"
  },
  "netMargin": {
    "value": 72.0,
    "previousPeriod": 69.4,
    "changePoints": 2.6
  }
}
```

### Notes
- `subscription.renewsAt` is the next billing date in ISO 8601 UTC.
- `billingCycle` is one of: `"monthly"` \| `"annual"`.
- `subscription.amount` is the amount charged per cycle, not a cumulative total.

---

## 12. Revenue Sources Breakdown

Returns revenue split by channel for the Revenue Sources widget.

**GET** `/api/vendor/finance/revenue-sources`

### Response
```json
{
  "total": 184200,
  "currency": "GHS",
  "sources": [
    { "label": "Auction Sales", "amount": 132624, "percentage": 72 },
    { "label": "Buy Now Sales", "amount": 34998, "percentage": 19 },
    { "label": "Lot Premiums",  "amount": 16578, "percentage": 9 }
  ]
}
```

---

## 13. Revenue Overview Chart

Returns time-series data for the Revenue Overview line chart.

**GET** `/api/vendor/finance/revenue-chart?range=weekly`

### Query Params

| Param   | Values                              | Default    |
|---------|-------------------------------------|------------|
| `range` | `weekly` \| `monthly` \| `yearly`  | `weekly`   |

### Response
```json
{
  "range": "weekly",
  "series": [
    { "timestamp": "2026-01-05T02:24:00Z", "revenue": 3800, "commission": 230 },
    { "timestamp": "2026-01-05T08:24:00Z", "commission": 320 }
  ]
}
```

### Notes
- `revenue` entries are sparse (auction close events); `commission` is recorded per transaction.
- `commission` is the platform's cut taken from each sale — shown on the chart for reference but not surfaced as a KPI card.
- All amounts are in GHS.

---

## 14. Earnings Breakdown (Donut Chart)

Returns the four earnings buckets shown in the donut chart.

**GET** `/api/vendor/finance/earnings-breakdown?currency=GHS`

### Query Params

| Param      | Values         | Default |
|------------|----------------|---------|
| `currency` | `GHS` \| `USD` | `GHS`   |

### Response
```json
{
  "currency": "GHS",
  "buckets": [
    { "key": "revenue",  "label": "Auction Revenue",    "amount": 148200, "percentage": 81.0 },
    { "key": "pending",  "label": "Pending Payouts",    "amount": 18400,  "percentage": 10.1 },
    { "key": "disputes", "label": "Held for Disputes",  "amount": 12400,  "percentage": 6.8  },
    { "key": "fees",     "label": "Platform Fees Paid", "amount": 4000,   "percentage": 2.2  }
  ],
  "total": 183000
}
```

---

## 15. Payout Accounts

Returns the vendor's linked bank and mobile money accounts.

**GET** `/api/vendor/finance/payout-accounts`

### Response
```json
{
  "bankAccounts": [
    { "id": "acct-001", "bank": "GCB Bank",       "last4": "4182", "balance": 12450.60, "currency": "GHS" },
    { "id": "acct-002", "bank": "Ecobank Ghana",   "last4": "1004", "balance": 3200.11,  "currency": "GHS" },
    { "id": "acct-003", "bank": "Stanbic Bank",    "last4": "9912", "balance": 2749.29,  "currency": "GHS" }
  ],
  "mobileMoney": [
    { "id": "mm-001", "provider": "MTN Mobile Money", "maskedNumber": "055 *** 4821", "balance": 1840.00, "currency": "GHS" },
    { "id": "mm-002", "provider": "Vodafone Cash",    "maskedNumber": "020 *** 7134", "balance": 160.00,  "currency": "GHS" }
  ]
}
```

---

## 16. Awaiting Payment

Returns lots whose auction has ended and a winner was declared, but the buyer has not yet completed payment. The platform does not hold funds — this widget gives the vendor visibility into incoming money and flags overdue buyers.

**GET** `/api/vendor/lots/awaiting-payment?limit=5`

### Response
```json
{
  "totalExpected": 14450,
  "currency": "GHS",
  "lots": [
    {
      "lotId": "AU-0421",
      "lotTitle": "Vintage Rolex Daytona Set",
      "winningBid": 4800,
      "currency": "GHS",
      "buyerRef": "BYR-0091",
      "auctionEndedAt": "2026-06-19T14:00:00Z",
      "paymentDueAt": "2026-06-22T23:59:00Z",
      "overdue": false
    },
    {
      "lotId": "AU-0415",
      "lotTitle": "Signed Muhammad Ali Gloves",
      "winningBid": 8400,
      "currency": "GHS",
      "buyerRef": "BYR-0087",
      "auctionEndedAt": "2026-06-16T16:44:00Z",
      "paymentDueAt": "2026-06-24T23:59:00Z",
      "overdue": false
    },
    {
      "lotId": "AU-0418",
      "lotTitle": "Rare Vinyl Records Collection",
      "winningBid": 1250,
      "currency": "GHS",
      "buyerRef": "BYR-0083",
      "auctionEndedAt": "2026-06-18T10:15:00Z",
      "paymentDueAt": "2026-06-19T23:59:00Z",
      "overdue": true
    }
  ]
}
```

### Notes
- `totalExpected` is the sum of all `winningBid` values in the response.
- `paymentDueAt` is determined by the platform's payment window policy (e.g. buyer has 3 days to pay).
- `overdue: true` when `paymentDueAt` is in the past and payment has not been received.
- `buyerRef` is an anonymised buyer identifier — do not expose buyer PII to the vendor.
- When `overdue: true`, the frontend shows an "Overdue" badge and a warning banner on the widget.

---

## 17. Subscription Plan

Returns the vendor's active subscription plan details — shown in the Premium Plan KPI card.

**GET** `/api/vendor/subscription`

### Response
```json
{
  "planName": "Premium",
  "billingCycle": "monthly",
  "amount": 299,
  "currency": "GHS",
  "status": "active",
  "renewsAt": "2026-07-20T00:00:00Z",
  "startedAt": "2025-07-20T00:00:00Z",
  "features": [
    "Unlimited lot submissions",
    "Priority review queue",
    "Analytics dashboard",
    "Dedicated support"
  ]
}
```

### Status values

| Value       | Meaning                                      |
|-------------|----------------------------------------------|
| `active`    | Subscription is current and paid             |
| `expiring`  | Paid but not set to auto-renew               |
| `past_due`  | Payment failed, grace period active          |
| `cancelled` | Subscription ended                           |

### Notes
- Frontend should show a warning banner if `status` is `expiring` or `past_due`.
- `amount` is the per-cycle charge, not a cumulative total.

---

## 18. Seller Trust Score

Returns the vendor's trust score and rank.

**GET** `/api/vendor/finance/trust-score`

### Response
```json
{
  "score": 94,
  "maxScore": 100,
  "percentileRank": 95,
  "previousScore": 91,
  "updatedAt": "2026-06-18T09:00:00Z"
}
```

---

## Summary of Endpoints

| Method | Path                                      | Purpose                                   |
|--------|-------------------------------------------|-------------------------------------------|
| GET    | `/api/vendor/dashboard/stats`             | KPI headline numbers (home)               |
| GET    | `/api/vendor/dashboard/bid-activity`      | Monthly bid activity chart                |
| GET    | `/api/vendor/tasks`                       | Today's task list                         |
| PATCH  | `/api/vendor/tasks/:taskId`               | Mark task complete/incomplete             |
| GET    | `/api/vendor/auctions/today`              | Upcoming auctions widget                  |
| GET    | `/api/vendor/lots`                        | Paginated submitted lots table            |
| GET    | `/api/vendor/disputes`                    | Open disputes list                        |
| GET    | `/api/vendor/lots/stats`                  | KPI strip numbers (lots page)             |
| GET    | `/api/vendor/lots/status-summary`         | Lot status gauge chart                    |
| GET    | `/api/vendor/lots/top`                    | Top performing lots widget                |
| GET    | `/api/vendor/feedback`                    | Seller rating and recent feedback         |
| GET    | `/api/vendor/finance/stats`               | Vendor finance KPI cards                  |
| GET    | `/api/vendor/finance/revenue-sources`     | Revenue breakdown by channel              |
| GET    | `/api/vendor/finance/revenue-chart`       | Revenue vs commission time-series chart   |
| GET    | `/api/vendor/finance/earnings-breakdown`  | Earnings donut chart buckets              |
| GET    | `/api/vendor/finance/payout-accounts`     | Linked bank + mobile money accounts       |
| GET    | `/api/vendor/lots/awaiting-payment`       | Lots won but buyer payment not yet received |
| GET    | `/api/vendor/subscription`                | Active subscription plan + renewal date   |
| GET    | `/api/vendor/finance/trust-score`         | Seller trust score and percentile rank    |
