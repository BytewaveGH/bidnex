"use client";

import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuctionsToday } from "../../home/_logics/useAuctionsToday";
import type { AuctionToday } from "../../home/_logics/useAuctionsToday";

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const today = format(new Date(), "EEEE, d MMMM");

type StatusConfig = {
  barColor: string;
  badgeClass: string;
  label: string;
};

function getStatusConfig(status: string): StatusConfig {
  const s = status?.toLowerCase();
  if (s === "live" || s === "active" || s === "pending") {
    return {
      barColor: "bg-green-600 dark:bg-green-400",
      badgeClass:
        "border-green-600/50 bg-green-50 px-2.5 py-1 font-medium text-[10px] text-green-600 dark:border-green-800/50 dark:bg-green-500/10 dark:text-green-400",
      label: "Live",
    };
  }
  if (s === "scheduled" || s === "upcoming") {
    return {
      barColor: "bg-yellow-500 dark:bg-yellow-400",
      badgeClass:
        "border-yellow-600/50 bg-yellow-50 px-2.5 py-1 font-medium text-[10px] text-yellow-700 dark:border-yellow-800/50 dark:bg-yellow-500/10 dark:text-yellow-300",
      label: "Scheduled",
    };
  }
  if (s === "withdrawn" || s === "cancelled") {
    return {
      barColor: "bg-destructive",
      badgeClass:
        "border-destructive/50 bg-destructive/10 px-2.5 py-1 font-medium text-[10px] text-destructive dark:border-destructive/50 dark:bg-destructive/20",
      label: "Withdrawn",
    };
  }
  return {
    barColor: "bg-muted-foreground/40",
    badgeClass: "border-border bg-muted/60 px-2.5 py-1 font-medium text-[10px] text-muted-foreground",
    label: "Ended",
  };
}

function formatEndTime(auction: AuctionToday): string {
  const raw = auction.bidEndTime ?? auction.endTime;
  if (!raw) return "";
  try {
    return `Closes ${timeFormatter.format(new Date(raw))}`;
  } catch {
    return "";
  }
}

function AuctionRow({ auction }: { auction: AuctionToday }) {
  const cfg = getStatusConfig(auction.status);
  const timeLabel = formatEndTime(auction);
  const bids = auction.bidCount ?? auction.bids ?? 0;
  const startingPrice = auction.currentBid ?? auction.startingBid ?? 0;
  const bidLabel = `Lot #${auction.id} · ${bids} bids · Starting GHS ${startingPrice.toLocaleString("en-US")}`;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 py-3 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 gap-2">
        <div className={`w-1 shrink-0 rounded-md ${cfg.barColor}`} />
        <div className="min-w-0 text-xs">
          {timeLabel && <div className="truncate font-medium text-foreground">{timeLabel}</div>}
          <div className="truncate text-muted-foreground">{today}</div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="truncate font-medium text-foreground text-sm leading-none">{auction.title}</div>
        <div className="truncate text-muted-foreground text-xs leading-none">{bidLabel}</div>
      </div>

      <Badge variant="secondary" className={`shrink-0 rounded-md ${cfg.badgeClass}`}>
        {cfg.label}
      </Badge>
    </div>
  );
}

export function ClassSchedule() {
  const { data: auctions, isLoading } = useAuctionsToday();

  return (
    <Card className="h-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm">Upcoming Auctions</CardTitle>
        <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
          View Full Schedule <ArrowRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3 py-3">
                <Skeleton className="h-8 w-24" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
            ))
          ) : auctions && auctions.length > 0 ? (
            auctions.map((auction) => <AuctionRow key={String(auction.id)} auction={auction} />)
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No auctions today</p>
              <p className="text-xs text-muted-foreground">Your scheduled lots will appear here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
