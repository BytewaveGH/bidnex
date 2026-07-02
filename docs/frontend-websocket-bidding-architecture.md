# Frontend: Real-Time Bidding Architecture

Reference doc — how live bidding actually works end to end on the frontend. Read this before
touching anything under `lib/websocket/`, `useLotRealtime.ts`, or the product detail page; it'll
save you from re-deriving the wire format from scratch. Companion doc for the backend contract:
`docs/backend-websocket-bidding-protocol.md` — keep the message catalogs in the two docs in sync.

## Layers, bottom to top

```
WebSocketClient (singleton)        lib/websocket/ws-client.ts
        ↓
TabLeader / TabRelay                lib/websocket/tab-leader.ts
        ↓
WebSocketProvider (React context)   components/generals/providers/websocket-provider.tsx
        ↓
useLotRealtime / useLotRealtimeWithActions   app/(bidder)/bidder/(all-items)/_logics/useLotRealtime.ts
        ↓
bid-notifications-provider (toast/sound)     components/generals/providers/bid-notifications-provider.tsx
        ↓
6 grid/list widgets + the product detail page
```

### `WebSocketClient` — connection lifecycle, heartbeat, room refcounting

One instance per browser tab (module-level singleton via `getWebSocketClient()`). Owns:

- **Auth handshake**: on open, sends `{type:'auth', token, role}`; expects `auth_success` or
  `auth_error`. `TOKEN_EXPIRING`/`EXPIRED_TOKEN` error codes trigger a token refresh (via next-auth's
  `update()`, wired in through `init({ onTokenRefresh })`) and a re-auth; any other `auth_error` is
  treated as unrecoverable and the client goes idle without retrying (retrying with the same bad
  token is pointless).
- **Reconnect**: exponential backoff (`2^attempt * 1000ms`, capped at 30s, plus jitter), driven by
  `scheduleReconnect()`. All paths that "lose the connection" — the socket's own `close` event, a
  server-sent `connection_timeout`, or a client-detected zombie connection — funnel through one
  shared `onConnectionLost()` so there's exactly one reconnect decision, not three slightly
  different ones. (Before this refactor, `connection_timeout` had its own path that forgot to
  schedule a reconnect at all — that was a real, silent-forever-idle bug, now fixed.)
- **Heartbeat + zombie detection**: sends `{type:'heartbeat', ts}` every 30s. Arms a 10s timer after
  each one; if `{type:'heartbeat_ack', ts}` doesn't come back in time, the client assumes the
  connection is a "zombie" (browser still reports `readyState === OPEN`, but the underlying
  connection silently died — laptop sleep, network switch, NAT timeout — and no `close`/`error`
  event will ever fire on it) and force-reconnects instead of waiting indefinitely. **This
  enforcement only turns on after the client has seen at least one real `heartbeat_ack` from the
  server** (tracked via `heartbeatAckSupported`) — until the backend ships that reply, this code
  path is a complete no-op, so it can't cause spurious reconnects against the current backend. On
  tab-visibility regain (laptop wake, switching back to the tab), the client also fires an
  out-of-band heartbeat probe immediately instead of waiting up to 30s for the next scheduled tick
  — this is the fast path for the "woke my laptop and it's stuck" case.
- **Auction room refcounting**: `joinAuction(auctionId)` increments a per-auction refcount and
  sends `join_auction` only on the 0→1 transition; the returned unsubscribe function decrements and
  sends `leave_auction` only on 1→0. This lets multiple independent hook instances (e.g. the
  product page and a `related-products` carousel both showing the same auction) share one room
  membership without either one prematurely leaving it out from under the other. All currently-held
  rooms are re-joined automatically on every `auth_success` (first connect and every reconnect),
  so no separate "did we just reconnect" bookkeeping is needed for this.
  - **Known limitation, accepted for now**: this refcount is per-tab. If a follower tab (see below)
    is the only one interested in a room and it unmounts while the leader tab still thinks it's
    relevant, there's a small cross-tab race. Not fixed — the bug this was built to fix (grid views
    never joining a room at all) is unconditionally worse.

### `TabLeader` / `TabRelay` — why there's only one physical socket per user

The backend enforces (as far as we've observed — see the open question in the backend doc) a
single WebSocket connection per user, and sends `{type:'kicked'}` to boot an older connection when
a new one authenticates. To let a user have multiple tabs open without them kicking each other,
`TabLeader` elects one tab as the "leader" (localStorage lock + `BroadcastChannel`, 4s TTL) — only
the leader ever opens a real socket. `TabRelay` proxies `send()` calls from follower tabs to the
leader (which forwards them over its real socket) and broadcasts inbound messages + connection
state from the leader back out to followers. If backend relaxes the single-session restriction,
this whole layer becomes deletable and each tab can just hold its own connection — worth revisiting
if that happens.

### `WebSocketProvider` — React context

Thin wrapper exposing `subscribe`, `send`, `joinAuction`, and `isConnected` off the singleton. Also
exports `useResyncOnReconnect(onReconnect)`: fires `onReconnect` on every `isConnected` false→true
transition, skipping the very first connect (that data is already fresh from the initial mount
fetch). This is the hook every data-fetching hook/widget uses to re-pull REST state after a dropped
connection comes back, since anything missed during the outage is otherwise gone until a manual
page refresh.

### `useLotRealtime` — the one merge-and-subscribe implementation

This used to have a near-duplicate hand-rolled copy in the product detail page (`rt` state + its
own subscribe effect) that had already drifted from this file once this session — a fix landed
here first and was missing there until found by hand. **There is now exactly one implementation.**

- `useLotRealtimeCore(lots)` (internal, not exported) does everything: subscribes to `subscribe()`,
  maintains `lotUpdates`/`auctionUpdates` override maps, joins/leaves rooms for every unique
  `auctionId` in the input lots, clears both override maps on `useResyncOnReconnect` (so a stale
  `isOutbid: true` from before an outage can't outlive the fresh REST data resync just fetched),
  and memoizes the merged `RealtimeLot[]` output (REST lot + WS overrides + derived fields like
  `suggestedBid`).
- `useLotRealtime(lots): RealtimeLot[]` — the public export used by all 6 grid/list widgets.
  Unchanged signature; they didn't need to change at all when room-joining and resync were added.
- `useLotRealtimeWithActions(lots): { lots, applyOptimisticBid }` — used only by the product detail
  page, which needs to apply an instant local override the moment its own bid/buy-now REST call
  succeeds (before the WS broadcast round-trips back).

Message handling inside the core (kept in sync with the backend doc's catalog):

| Message | Effect |
|---|---|
| `auction_update` / bid placed (detected by `lotId` + `currentBid` presence) | Updates `currentBid`, `bidCount`, `bidEndTime`, `winnerId`, `isWinning`, `isOutbid` |
| `auction_update` / `lot_sold` | Marks the lot closed, sets `currentBid` to the sold price |
| `auction_update` / auction closed (`status: ended\|cancelled`) | Marks every lot in that auction closed |
| `auction_update` / legacy public `outbid` | Same effect as the private version below — kept for backward compat with a backend that still sends this shape |
| `user_event` `bidder_outbid` | Sets `isOutbid: true, isWinning: false`, applies `data.amount` to `currentBid`. **This was the original bug this session**: an earlier version of this handler updated `isOutbid` but silently dropped `amount`, so the bid amount shown in the UI never changed. Also optimistically bumps `bidCount` by 1 since the current payload doesn't include an updated count (see backend doc — asking them to send it directly instead). |
| `user_event` `bidder_winning` (**new**, not sent by backend yet) | Sets `isWinning: true, isOutbid: false`, applies `amount`/`bidCount`/`endTime`/`antiSniped`. Inert until backend ships it; see the backend doc. |
| `user_event` `auction_won` | Sets `isWon: true, isWinning: true, isClosed: true` |

### `bid-notifications-provider` — toast + sound

Purely reactive to whatever `subscribe()` delivers — no optimistic trigger when the user's own bid
succeeds (that instant feedback is `applyOptimisticBid`'s job, on the product page only; grid views
rely on the WS round-trip same as before). Plays `playWinning()`/`playOutbid()` and shows a toast
for `bidder_outbid`, the new `bidder_winning`, and `auction_won`, plus a public-broadcast fallback
for winning (kept for as long as the backend hasn't shipped `bidder_winning`).

### The consumers: 6 grid/list widgets + the product page

`all-items.tsx`, `watchlist.tsx`, `my-bids.tsx`, `featured-items.tsx`, `live-auctions.tsx`,
`related-products.tsx` all follow the same shape: a REST data hook (`usePublicLots`,
`useWatchlist`, `useMyBids`, `usePublicAuctions`) → `useLotRealtime(lots)` → `useResyncOnReconnect(refetch)`
→ render `LotCardItem`. Each REST hook now exposes a stable `refetch` (an internal
`resyncToken` counter bumped on each call, added to the fetch effect's dependency array — these
hooks are hand-rolled `useEffect` fetchers, not react-query, so this had to be built rather than
gotten for free via `invalidateQueries`).

The product detail page (`product/[id]/page.tsx`) is the one place that also needs
`applyOptimisticBid` (from `useLotRealtimeWithActions`) for its own bid/buy-now success handlers,
and calls `useResyncOnReconnect(refetch)` itself (on `usePublicLot`'s refetch) rather than through a
widget wrapper.

## Migrating the data hooks to react-query

`usePublicLots`, `usePublicLot`, `usePublicAuctions`, `useWatchlist`, and `useMyBids` are all
hand-rolled `useState`/`useEffect` fetchers even though `@tanstack/react-query` is installed and
provisioned (`ReactQueryProvider` is mounted, just unused for lot/auction data — only
`useVendorTasks.ts` on the vendor side actually uses `useQuery`). The `resyncToken`/`refetch`
pattern added here works fine as-is, but if these ever move onto react-query, reconnect-resync
becomes a one-line `queryClient.invalidateQueries(...)` instead. Not done as part of this change —
flagging it as a reasonable future cleanup, not a prerequisite for anything here.
