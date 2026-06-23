# Backend Task: Webhook & Vendor Payout Transfer

## Context

After a bidder pays via the Moolre payment link, Moolre sends a callback to our server. We must:
1. Log the payment for tracking.
2. For each paid lot, look up the winning vendor and transfer their share via the Moolre transfer API.
3. Update relevant database tables.

This document also amends the payment link generation from `backend-checkout-payment-link.md` — the `redirect` and `callback` fields must now be filled in.

---

## 1. Amendment — Payment Link Generation

In `POST /bidder/checkout`, update the Moolre body fields that were previously left empty:

```json
{
  "callback": "https://bidnex.vercel.app/api/webhooks/moolre/payment",
  "redirect": "https://bidnex.vercel.app/"
}
```

- `callback` — Moolre will POST to this URL when payment is confirmed.
- `redirect` — Moolre redirects the user's browser here after payment.

> Store the Moolre `reference` returned from the payment link response alongside the lot IDs in a
> pending-payment record. You will need it to reconcile the webhook callback.

---

## 2. Webhook Endpoint — `POST /api/webhooks/moolre/payment`

This is a **public** endpoint — no auth required (Moolre calls it server-to-server).

### Expected Moolre callback body

Moolre will POST a JSON body. Treat any field with a payment `status` indicating success as a
confirmed payment. At minimum expect:

```json
{
  "reference": "uuid-1234as2",
  "status": "successful",
  "amount": "1250.80"
}
```

Verify the `reference` matches a pending-payment record in your DB. If not found, return `200` and
ignore (Moolre may retry — always return `200` to stop retries even on unknown references).

### What to do on a confirmed payment

1. **Log** — write a payment log record (reference, amount, timestamp, raw payload) for audit.
2. **Mark lots as paid** — find the lot IDs linked to this reference, set their payment status to `paid`.
3. **Trigger vendor payouts** — for each paid lot, run the payout flow described in §3 below.
4. Return `{ "status": "ok" }` with HTTP `200`.

---

## 3. Vendor Payout Transfer (per lot)

Run this for each lot after payment is confirmed.

### Step 1 — Identify the vendor's default payout account

1. From the lot record, get `vendorId`.
2. Fetch that vendor's payout accounts.
3. Find the account where `isDefault = true`.
4. From that account, read `accountNo` (the mobile number) and `provider`.

### Step 2 — Map provider to Moolre channel

| Provider | Channel |
|---|---|
| MTN | `"1"` |
| TELECEL | `"6"` |
| AT | `"7"` |

> Skip the transfer and flag for manual review if the vendor has no default account or their
> provider is not in this map (e.g. bank — not supported yet).

### Step 3 — Calculate the transfer amount

```
gross_bid        = lot.currentBid
platform_charge  = min(gross_bid × 0.03, 15.00)   ← our 3%, capped at GHS 15
transfer_amount  = gross_bid - platform_charge
```

Moolre automatically deducts their own fee (1%, capped at GHS 10) from `transfer_amount` on their
side. This leaves a net platform revenue of ~2%, capped at GHS 5.

> Format `transfer_amount` as a string with 2 decimal places, e.g. `"97.00"`.

### Step 4 — Call the Moolre transfer API

```
POST https://sandbox.moolre.com/open/transact/transfer
```

> Replace `sandbox.moolre.com` with the production hostname in production env.

Headers:
```
X-API-USER: <MOOLRE_API_USER env var>
X-API-KEY:  <MOOLRE_API_KEY env var>    ← private key, NOT the PUBKEY used for payment links
Content-Type: application/json
```

Body:
```json
{
  "type": 1,
  "channel": "<mapped channel string — '1', '6', or '7'>",
  "currency": "GHS",
  "amount": "<transfer_amount as string>",
  "receiver": "<vendor default accountNo>",
  "sublistid": "",
  "externalref": "<lotId>-<Date.now()>",
  "reference": "<lotId>-paid-<bidderUsername>",
  "accountnumber": "<MOOLRE_ACCOUNT_NUMBER env var>"
}
```

**Field notes:**
- `externalref` — must be globally unique. Use `{lotId}-{timestamp}` e.g. `"78-1719148800000"`.
- `reference` — human-readable, should be unique. Use `{lotId}-paid-{bidderUsername}` e.g. `"78-paid-kwame"`.
- `accountnumber` — our Moolre merchant account number (same env var as payment link generation).

### Step 5 — Record the payout

After a successful Moolre transfer response, write a payout record to the vendor finance table:

| Field | Value |
|---|---|
| `lotId` | the lot ID |
| `vendorId` | the vendor |
| `grossAmount` | `lot.currentBid` |
| `platformCharge` | `min(lot.currentBid × 0.03, 15)` |
| `transferAmount` | `grossAmount - platformCharge` |
| `moolreReference` | the `reference` from Moolre's transfer response |
| `status` | `"completed"` or `"failed"` |
| `createdAt` | timestamp |

If the Moolre transfer fails, set `status = "failed"` and log the error. Do **not** retry
automatically — flag it for manual review.

---

## 4. Environment Variables

Add alongside the existing Moolre vars:

```
MOOLRE_API_KEY=BnKpIHhCrNG8xtgWcETc3jjm7ukf2Rz6BlFBogHqxElLnQ68NHu5id0s3F4wRtot
```

> `MOOLRE_API_KEY` (private key) is used **only** for the transfer endpoint.
> `MOOLRE_API_PUBKEY` (public key) is used **only** for generating payment links.
> Never swap them.

Full env var reference:

| Variable | Used for |
|---|---|
| `MOOLRE_API_USER` | Both payment link + transfer |
| `MOOLRE_API_PUBKEY` | Payment link generation only |
| `MOOLRE_API_KEY` | Transfer (payout) only |
| `MOOLRE_ACCOUNT_NUMBER` | Both |
| `MOOLRE_BUSINESS_EMAIL` | Payment link generation only |

---

## 5. Database Tables Affected

| Table | Change |
|---|---|
| `payment_logs` | New record on every webhook hit (success or failure) |
| `lots` | `paymentStatus` → `"paid"` after confirmation |
| `vendor_payouts` | New record per lot after transfer (success or failure) |

---

## 6. Summary Checklist

- [ ] Payment link `callback` set to `https://bidnex.vercel.app/api/webhooks/moolre/payment`
- [ ] Payment link `redirect` set to `https://bidnex.vercel.app/`
- [ ] Moolre `reference` stored with the pending-payment record on checkout
- [ ] `POST /api/webhooks/moolre/payment` endpoint created (public, no auth)
- [ ] Webhook always returns `200` (even on unknown reference) to stop Moolre retries
- [ ] Payment logged on every confirmed webhook
- [ ] Lot `paymentStatus` updated to `paid`
- [ ] Vendor payout triggered per lot
- [ ] Provider → channel mapping correct (MTN=1, TELECEL=6, AT=7)
- [ ] No default account or unsupported provider → flag for manual review, do not crash
- [ ] `transfer_amount = lot.currentBid - min(lot.currentBid × 0.03, 15)`
- [ ] `externalref` is unique per transfer (`{lotId}-{timestamp}`)
- [ ] `reference` is descriptive and unique (`{lotId}-paid-{bidderUsername}`)
- [ ] Transfer uses `X-API-KEY` (private), not `X-API-PUBKEY`
- [ ] Payout record written to vendor finance table (success or failure)
- [ ] Failed transfers flagged for manual review, not silently swallowed
