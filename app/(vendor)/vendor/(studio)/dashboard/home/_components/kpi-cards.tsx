"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useDashboardStats } from "../_logics/useDashboardStats";

function formatGHS(amount: number): string {
  if (amount >= 1_000_000) return `GHS ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `GHS ${(amount / 1_000).toFixed(1)}K`;
  return `GHS ${amount.toLocaleString("en-US")}`;
}

function TrendBadge({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  const positive = value >= 0;
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 whitespace-nowrap",
        positive
          ? "border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {positive ? <TrendingUp /> : <TrendingDown />}
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}

function DeltaBadge({ value, suffix = "" }: { value: number | undefined; suffix?: string }) {
  if (value === undefined || value === 0) return null;
  const positive = value >= 0;
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 whitespace-nowrap",
        positive
          ? "border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {positive ? <TrendingUp /> : <TrendingDown />}
      {positive ? "+" : ""}
      {value}
      {suffix}
    </Badge>
  );
}

function CardHeaderAction({
  isLoading,
  badge,
}: {
  isLoading: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <CardAction>
      {isLoading ? (
        <Skeleton className="h-6 w-16" />
      ) : badge ? (
        badge
      ) : (
        <ArrowUpRight className="size-4 text-muted-foreground" />
      )}
    </CardAction>
  );
}

export function KpiCards() {
  const { data, isLoading } = useDashboardStats();

  const activeAuctionsDelta =
    data?.activeAuctionsLastMonth !== undefined
      ? (data.activeAuctions ?? 0) - data.activeAuctionsLastMonth
      : undefined;

  const avgBidsDelta =
    data?.avgBidsPerLotLastMonth !== undefined
      ? Number(((data.avgBidsPerLot ?? 0) - data.avgBidsPerLotLastMonth).toFixed(1))
      : undefined;

  return (
    <section className="min-w-0 space-y-5">
      <div className="space-y-1">
        <h2 className="text-3xl tracking-tight">Auction Overview</h2>
        <p className="text-muted-foreground text-sm">
          Track your auction revenue, active lots, bid activity, and win rates across the current period.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader>
            <CardDescription>Total Auction Revenue</CardDescription>
            <CardHeaderAction isLoading={isLoading} badge={<TrendBadge value={data?.revenueChange} />} />
          </CardHeader>
          <CardContent className="min-w-0 space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-3xl leading-none tracking-tight tabular-nums">
                {formatGHS(data?.totalRevenue ?? 0)}
              </span>
            )}
            <p className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <>
                  <span className="font-medium text-foreground">{formatGHS(data?.revenueLastMonth ?? 0)}</span>{" "}
                  <span className="text-muted-foreground">last month</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardDescription>Bid Win Rate</CardDescription>
            <CardHeaderAction isLoading={isLoading} badge={<TrendBadge value={data?.winRateChange} />} />
          </CardHeader>
          <CardContent className="min-w-0 space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-3xl leading-none tracking-tight tabular-nums">
                {(data?.winRate ?? 0).toFixed(1)}%
              </span>
            )}
            <p className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <span className="font-medium text-foreground">{(data?.winRateLastMonth ?? 0).toFixed(1)}%</span>{" "}
                  <span className="text-muted-foreground">last month</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardDescription>Active Auctions</CardDescription>
            <CardHeaderAction isLoading={isLoading} badge={<DeltaBadge value={activeAuctionsDelta} />} />
          </CardHeader>
          <CardContent className="min-w-0 space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-3xl leading-none tracking-tight tabular-nums">{data?.activeAuctions ?? 0}</span>
            )}
            <p className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  <span className="font-medium text-foreground">{data?.activeAuctionsLastMonth ?? 0}</span>{" "}
                  <span className="text-muted-foreground">last month</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardDescription>Avg. Bids per Lot</CardDescription>
            <CardHeaderAction isLoading={isLoading} badge={<DeltaBadge value={avgBidsDelta} />} />
          </CardHeader>
          <CardContent className="min-w-0 space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <span className="text-3xl leading-none tracking-tight tabular-nums">
                {(data?.avgBidsPerLot ?? 0).toFixed(1)}
              </span>
            )}
            <p className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  <span className="font-medium text-foreground">{(data?.avgBidsPerLotLastMonth ?? 0).toFixed(1)}</span>{" "}
                  <span className="text-muted-foreground">last month</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
