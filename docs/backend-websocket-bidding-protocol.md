# Backend Task: Real-Time Bidding WebSocket Protocol

## Context

Bidders have reported two real, reproducible problems with live bidding:

1. **Winning a bid from a grid/list view (All Items, Watchlist, My Bids, Featured, Live Auctions,
   Related Products) never shows a toast or plays a sound.** It only works from the single-lot
   product detail page. We believe this is because your server scopes the "someone bid" broadcast
   to clients that sent `join_auction` for that auction — and only the product detail page ever
   sends that message. We've now fixed the frontend to join every relevant room from every view,
   but we also want to remove the dependency on room-join timing entirely for the two people who
   actually need to know (previous top bidder, new top bidder) — see §4.
2. **Some bidders report the app "disconnects and never recovers,"** especially after their laptop
   sleeps or their network switches. We found the client's heartbeat is fire-and-forget — it never
   checks for a reply, so a connection that silently died (readyState still reports open, no
   close/error event ever fires) is never detected. We need you to reply to heartbeats so the
   client can tell a live connection from a dead one. We also found and fixed a client-side bug
   where `connection_timeout` wasn't triggering a reconnect at all — that part didn't need your
   involvement, it's already shipped.

This doc is the full contract for what your server needs to send/accept, old and new. Where a
shape already exists and works today, it's included for completeness — look for **NEW** / **CHANGED**
markers for what actually needs backend work.

---

## 1. Connection Lifecycle

| Dir | Type | Shape | Status |
|---|---|---|---|
| C→S | `auth` | `{type:'auth', token, role}` | unchanged |
| S→C | `auth_success` | `{type:'auth_success'}` | unchanged |
| S→C | `auth_error` | `{type:'auth_error', error:{code}}` | unchanged. Codes `TOKEN_EXPIRING`/`EXPIRED_TOKEN` make the client refresh its token and retry; any other code is treated as a hard failure (bad credentials) and the client will **not** auto-reconnect. |
| S→C | `kicked` | `{type:'kicked'}` | **CHANGED (optional but requested)** — add a `reason` field, e.g. `{type:'kicked', reason:'single_session_replaced'}`. Today the client gets no explanation and just stops reconnecting silently. See the open question in §7 about whether this should still happen at all. |
| C→S | `heartbeat` | `{type:'heartbeat', ts}` | `ts` is the client's own `Date.now()`, sent every 30s. Already sent today; only the reply is new. |
| S→C | `heartbeat_ack` | `{type:'heartbeat_ack', ts}` | **NEW — this is the one thing that unblocks bug #2.** Reply to every `heartbeat` you receive with this, echoing back the client's `ts` unchanged. The client arms a 10s timer after every heartbeat it sends; if this reply doesn't arrive in time, it tears down the socket and reconnects. **Until you ship this, the client's new zombie-detection logic stays completely inert (zero behavior change) — it only activates once it sees its first `heartbeat_ack`.** |
| S→C | `connection_timeout` | `{type:'connection_timeout'}` | Already sent today. Please confirm: is this an idle-timeout (no message received from the client for N seconds)? If so, tell us the current N — we'd like the client's own heartbeat cadence to stay comfortably under it. |

---

## 2. Room Membership — Public, Per-Auction

| Dir | Type | Shape |
|---|---|---|
| C→S | `join_auction` | `{type:'join_auction', auctionId}` |
| C→S | `leave_auction` | `{type:'leave_auction', auctionId}` |

Already implemented. The frontend now sends these from every view that renders lot cards, not just
the product detail page — expect more of these messages per connection than before, and please
confirm sending `join_auction` twice for a room the connection is already in (or `leave_auction`
for a room it already left) is a harmless no-op, not an error.

Also confirm: room membership does **not** survive a reconnect (i.e., a new socket connection has
to send `join_auction` again even for rooms the previous connection on that same session had
joined). The frontend now re-sends all of its currently-held room joins immediately after every
`auth_success`, including on reconnect — if room membership actually does persist server-side
across reconnects for the same user/session, let us know so we don't need to do this.

---

## 3. Public Broadcasts — `auction_update`

| Sub-shape | Shape | Status |
|---|---|---|
| Bid placed | `{type:'auction_update', data:{lotId, currentBid, bidCount, endTime, antiSniped, winnerId}}` | **CHANGED** — please add an explicit `type:'bid_placed'` field inside `data`. Today the frontend has to guess this is a "bid placed" message by checking that `lotId` and `currentBid` are both present, because nothing else distinguishes it. That's fragile — a future field addition to some other event could accidentally look like a bid. |
| Lot sold (Buy Now) | `{type:'auction_update', data:{type:'lot_sold', lotId, soldPrice, winnerId}}` | **CHANGED** — please add `auctionId` to this payload. It's missing today; the frontend needs it to route the message to the right room-scoped listeners. |
| Auction closed | `{type:'auction_update', data:{auctionId, status:'ended'\|'cancelled'}}` | **CHANGED (two things)** — please (a) add an explicit `type:'auction_closed'` field, and (b) consider broadcasting this **globally** (all connected bidder sockets) instead of only to the `auctionId` room. It's low-frequency (once per auction) but high-importance, and is consumed by widgets like "My Bids" that show lots across many auctions a user never explicitly joined a room for. If there's a reason this must stay room-scoped (scale, tenant isolation), let us know and we'll adjust. |
| Outbid (legacy, public) | `{type:'auction_update', data:{type:'outbid', userId, lotId, amount}}` | **Please stop sending this if you still do.** It's superseded by the private `bidder_outbid` user_event in §4, which is what we've actually observed firing in production. Keeping both risks a double toast/sound and inherits the exact room-membership bug we're trying to eliminate for the winning case. |

**Scope:** `bid_placed` and `lot_sold` should stay room-scoped to `auctionId` (high frequency,
narrow audience). `auction_closed` — see recommendation above to make it global.

---

## 4. Private Per-User Notifications — `user_event`

These are delivered directly to one user's connection(s), independent of any room membership. This
is the important part: **the two people directly affected by a bid must be notified this way,
never only via the room broadcast in §3.**

| `event` | `data` shape | Status |
|---|---|---|
| `bidder_outbid` | `{type:'outbid', lotId, auctionId, amount, lotTitle, message, timestamp, userId}` | **CHANGED** — please also include `bidCount`, `endTime`, and `antiSniped` in this payload. Today's real captured payload only has `amount`, so the frontend has to *guess* the new bid count by incrementing its last-known value by 1, which can drift. |
| `bidder_winning` | `{type:'winning', lotId, auctionId, amount, bidCount, endTime, antiSniped, lotTitle, message, timestamp, userId}` | **NEW.** Symmetric counterpart to `bidder_outbid`. Send this privately to whoever becomes the new top bidder as a result of a bid being accepted — regardless of whether their connection has joined that auction's room. This is what actually fixes the "no winning notification from grid views" bug: it stops depending on room-join timing entirely, the same way outbid already works today. Frontend code to consume this is already written and shipped; it is a complete no-op until you send this event. |
| `auction_won` | `{type:'auction_won', lotId, auctionId, soldPrice, lotTitle, message, timestamp, userId}` | unchanged shape, still supported. |

**Fire rule for `bidder_winning`:** only fire it when the winning bidder actually *changed* as a
result of this bid resolution (or this is the lot's very first bid). Don't fire it when a bidder
raises their own standing max bid with no competing bidder — that's a no-op for them and would be a
false-positive "You're Winning!" toast for something that didn't change.

**Important — auto-proxy/max-bid bids:** if your auto-counter-bid engine (triggered when someone
sets a max bid and is later outbid automatically) runs through a different code path than a manual
bid, please make sure it **also** emits `bidder_outbid`/`bidder_winning` through the same logic.
Otherwise proxy-triggered wins/losses will silently not notify anyone, defeating the point of this
change.

---

## 5. Scope Decision Table (summary of the above)

| Message | Scope |
|---|---|
| `bid_placed`, `lot_sold` | Room (`auctionId`) |
| `auction_closed` | Recommend global (see §3) |
| `bidder_outbid`, `bidder_winning`, `auction_won` | Private, per-user, room-independent |
| `heartbeat_ack`, `kicked`, `connection_timeout`, `auth_*` | Per-connection |

---

## 6. Bid Resolution Sequencing

On every accepted bid (manual or proxy):

1. Compute `previousWinnerId` (who was winning before this bid) and `newWinnerId` (who's winning
   now).
2. If they differ (or there was no previous winner): send `bidder_outbid` privately to
   `previousWinnerId` (if one exists) and `bidder_winning` privately to `newWinnerId` — both
   regardless of room membership.
3. Separately, broadcast `bid_placed` to the `auctionId` room, for onlookers who are neither the
   previous nor new top bidder but are watching the lot live.

---

## 7. Open Questions — Please Answer Explicitly

1. **Is single-connection-per-user (`kicked`) still load-bearing?** Bids are placed over REST, not
   WS — so we don't see an obvious correctness reason for the server to reject a second concurrent
   connection from the same user (e.g. two browser tabs, or a phone + laptop). This restriction is
   the entire reason the frontend built a cross-tab "leader election" system (one tab holds the
   real socket, others relay through it) — real complexity that exists solely to work around this.
   If there's no strong reason to keep it (cost control, anti-bot throttling, accurate
   viewer-presence counts), we'd like to remove the single-session restriction and delete that
   frontend complexity. If it must stay, please say why, and include the `reason` field on `kicked`
   regardless.
2. **Does the auto-proxy/max-bid engine share the same bid-resolution code path as manual bids?**
   (see §4 — needed for `bidder_winning` to fire on proxy wins too.)
3. **What currently triggers `connection_timeout`?** Confirm it's an idle-timeout and give us the
   current threshold.
4. **Any constraint against making `auction_closed` global** instead of room-scoped?
5. **Is double `join_auction` / redundant `leave_auction` safe** (no-op, not an error)?
6. **Does this WebSocket endpoint serve other roles** (vendor/admin) besides bidder? The `auth`
   message already carries a `role` field, suggesting it might. If so, confirm whether
   `bidder_winning`/the room rules above are bidder-specific or apply identically to other roles.

---

## 8. Summary Checklist

- [ ] Reply to every `{type:'heartbeat', ts}` with `{type:'heartbeat_ack', ts}` (echo `ts` unchanged)
- [ ] Add `type:'bid_placed'` discriminator inside the existing bid-placed `auction_update.data`
- [ ] Add `auctionId` to the `lot_sold` payload
- [ ] Add `type:'auction_closed'` discriminator to the auction-closed payload; consider broadcasting it globally instead of room-scoped
- [ ] Stop sending the legacy public `{data:{type:'outbid'}}` broadcast if still sent
- [ ] Enrich `bidder_outbid` with `bidCount`, `endTime`, `antiSniped`
- [ ] Implement new `bidder_winning` private user_event, fired to the new top bidder on every bid resolution where the winner changed — regardless of room membership, and including proxy/max-bid wins
- [ ] Add `reason` field to `kicked`
- [ ] Answer the six open questions in §7 (especially: is single-session-per-user still required?)
