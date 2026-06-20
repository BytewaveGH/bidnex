"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      className={
        positive
          ? "border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }
    >
      {positive ? <TrendingUp /> : <TrendingDown />}
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}

export function KpiCards() {
  const { data, isLoading } = useDashboardStats();

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-3xl tracking-tight">Auction Overview</h2>
        <p className="text-muted-foreground text-sm">
          Track your auction revenue, active lots, bid activity, and win rates across the current period.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Auction Revenue</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <span className="text-3xl leading-none tracking-tight">
                    {formatGHS(data?.totalRevenue ?? 0)}
                  </span>
                  <TrendBadge value={data?.revenueChange} />
                </>
              )}
            </div>
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

        <Card>
          <CardHeader>
            <CardDescription>Bid Win Rate</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <span className="text-3xl leading-none tracking-tight">{(data?.winRate ?? 0).toFixed(1)}%</span>
                  <TrendBadge value={data?.winRateChange} />
                </>
              )}
            </div>
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

        <Card>
          <CardHeader>
            <CardDescription>Active Auctions</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <span className="text-3xl leading-none tracking-tight">{data?.activeAuctions ?? 0}</span>
                  {data?.activeAuctionsLastMonth !== undefined && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
                    >
                      <TrendingUp />+{(data.activeAuctions ?? 0) - data.activeAuctionsLastMonth}
                    </Badge>
                  )}
                </>
              )}
            </div>
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

        <Card>
          <CardHeader>
            <CardDescription>Avg. Bids per Lot</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <span className="text-3xl leading-none tracking-tight">{(data?.avgBidsPerLot ?? 0).toFixed(1)}</span>
                  {data?.avgBidsPerLotLastMonth !== undefined && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
                    >
                      <TrendingUp />+{((data.avgBidsPerLot ?? 0) - data.avgBidsPerLotLastMonth).toFixed(1)}
                    </Badge>
                  )}
                </>
              )}
            </div>
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
