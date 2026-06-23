# Backend Task: Moolre Payment Link — Checkout Endpoint

## Context

The bidder checkout flow lives at `/bidder/billing`. When the user clicks **"Confirm and Pay"**, the
frontend calls `POST /bidder/checkout` with a list of lot IDs. The frontend expects a payment URL
back, which it then opens in a new browser tab.

The frontend hook (`useGeneratePaymentLink`) and the `checkout.tsx` widget are already wired up.
Your job is to implement the backend endpoint and add one small frontend fix.

---

## 1. New API Route — `POST /bidder/checkout`

### Request body (sent by frontend)

```json
{ "lotIds": [12, 45, 78] }
```

### What the endpoint must do

1. **Authenticate** — endpoint must be protected; only a logged-in bidder may call it.
2. **Look up the lots** — fetch the lots for the given `lotIds`. Use only lots that:
   - belong to the authenticated bidder (i.e., the bidder won them), and
   - have **not** already been paid.
3. **Calculate amounts**
   - `subtotal` = sum of `currentBid` across qualifying lots
   - `fee` = sum of `min(lot.currentBid × 0.02, 3.00)` per lot — 2% per item, capped at GHS 3.00 each
   - `total` = `subtotal + fee`
4. **Generate the Moolre payment link** by calling:

   ```
   POST https://api.moolre.com/embed/link
   ```

   Headers:
   ```
   X-API-USER:   <MOOLRE_API_USER env var>
   X-API-PUBKEY: <MOOLRE_API_PUBKEY env var>   ← note: PUBKEY, not KEY
   Content-Type: application/json
   ```

   Body:
   ```json
   {
     "type": 1,
     "amount": "<total as a string, e.g. \"1250.75\">",
     "email": "<MOOLRE_BUSINESS_EMAIL env var>",
     "externalref": "<unique ref — use Date.now() or UUID>",
     "callback": "",
     "redirect": "",
     "reusable": "0",
     "currency": "GHS",
     "accountnumber": "<MOOLRE_ACCOUNT_NUMBER env var>",
     "metadata": {},
     "expiration_time": ""
   }
   ```

   > `amount` must be the **total** (subtotal + fee), formatted as a string with up to 2 decimal
   > places. Do not send the subtotal alone.

5. **Return** the following JSON to the frontend:

   ```json
   {
     "data": {
       "paymentUrl": "<authorization_url from Moolre response>",
       "subtotal": 1087.65,
       "fee": 163.15,
       "total": 1250.80
     }
   }
   ```

   The `paymentUrl` is `data.authorization_url` from the Moolre response.

6. **Error handling**
   - If Moolre returns `status !== 1`, return `400` with the Moolre `message`.
   - If any env var is missing, return `500` with `"Payment provider not configured."`.
   - If no qualifying lots are found, return `400` with `"No eligible lots for payment."`.

---

## 2. Environment Variables to Add

Add these to `.env.local` (and to production secrets):

```
MOOLRE_API_USER=mickeynew
MOOLRE_API_PUBKEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
MOOLRE_ACCOUNT_NUMBER=976860511870
MOOLRE_BUSINESS_EMAIL=<the business email that receives payment notifications>
```

> **Note:** The existing `resolve-momo` route uses `X-API-KEY`. This new endpoint uses
> `X-API-PUBKEY` — a **different** header and a different env var. Do not mix them up.

---

## 3. Frontend Fix (one line)

In [checkout.tsx](../app/(bidder)/bidder/(billing)/billing/_widgets/checkout.tsx) at line 115,
change:

```ts
// before
window.location.href = result.paymentUrl;

// after
window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
```

This opens the Moolre payment page in a new tab instead of navigating away from the checkout page.

---

## 4. Moolre API Reference

| Field | Value |
|---|---|
| Endpoint | `POST https://api.moolre.com/embed/link` |
| Auth header | `X-API-USER` + `X-API-PUBKEY` |
| `type` | Always `1` |
| `currency` | Always `GHS` |
| `reusable` | Always `"0"` |
| `externalref` | Unique per request — use `Date.now().toString()` or a UUID |
| `email` | Business email from env — **not** the bidder's email |
| `amount` | The **total** (including platform fee) as a string |

Sample success response from Moolre:
```json
{
  "status": 1,
  "code": "POS09",
  "message": "POS payment link successfully generated.",
  "data": {
    "authorization_url": "https://pos.moolre.com/RZWs1yB6amGjNoiEQvlHPS5uqgp3Jc",
    "reference": "uuid-1234as2"
  }
}
```

---

## 5. Summary Checklist

- [ ] `POST /bidder/checkout` route created and auth-protected
- [ ] Lots validated (winner = current bidder, unpaid only)
- [ ] Subtotal / fee / total calculated correctly
- [ ] Moolre called with `X-API-PUBKEY` header (not `X-API-KEY`)
- [ ] `amount` = total (not subtotal), sent as a string
- [ ] `email` = business email from env (not bidder email)
- [ ] `externalref` is unique per request
- [ ] Response shape matches `{ data: { paymentUrl, subtotal, fee, total } }`
- [ ] All credentials in env vars only — nothing hardcoded
- [ ] Frontend `window.location.href` → `window.open(..., "_blank")` updated
