"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useFinanceStats } from "../_logics/useFinanceStats";
import { useSubscription } from "../_logics/useSubscription";

function formatGHS(amount: number | undefined | null): string {
  const value = amount ?? 0;
  if (value >= 1_000_000) return `GHS ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `GHS ${(value / 1_000).toFixed(1)}K`;
  return `GHS ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function OverviewKpis() {
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: sub, isLoading: subLoading } = useSubscription();

  const isLoading = statsLoading || subLoading;

  const lotsUsage = sub ? `${sub.lotsUsed} / ${sub.lotLimit}` : "—";
  const lotsSubtitle = sub
    ? sub.lotsUsed > sub.lotLimit
      ? `${sub.lotsUsed - sub.lotLimit} over lot limit`
      : `${sub.lotLimit - sub.lotsUsed} lots remaining`
    : "Lot usage unavailable";
  const statusLabel = sub?.status
    ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1).replace(/_/g, " ")
    : "—";

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid grid-cols-1 xl:grid-cols-8">
        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-40" />
                </>
              ) : (
                <>
                  <div className="text-3xl leading-none tracking-tight">{formatGHS(stats?.totalEarnings)}</div>
                  <p className="text-muted-foreground text-xs">
                    {stats?.totalSales != null ? `${stats.totalSales} total sales` : "All-time earnings"}
                  </p>
                </>
              )}
            </div>
            {!isLoading && stats?.earningsChange != null && (
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                {stats.earningsChange >= 0 ? "+" : ""}
                {stats.earningsChange.toFixed(1)}%
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">Available to Withdraw</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3 w-48" />
                </>
              ) : (
                <>
                  <div className="text-3xl leading-none tracking-tight">{formatGHS(stats?.availableBalance)}</div>
                  <p className="text-muted-foreground text-xs">
                    {stats?.pendingPayments
                      ? `${stats.pendingPayments} payment${stats.pendingPayments === 1 ? "" : "s"} pending`
                      : "Ready to transfer to your payout account"}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-normal">
              <span>Subscription</span>
              {!isLoading && sub && (
                <span className="text-muted-foreground text-sm">{sub.planLabel} Plan</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-36" />
                </>
              ) : (
                <>
                  <div className="text-3xl leading-none tracking-tight">{lotsUsage}</div>
                  <p className="text-muted-foreground text-xs">{lotsSubtitle}</p>
                </>
              )}
            </div>
            {!isLoading && sub && (
              <Badge
                className={
                  sub.status === "active"
                    ? "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
                }
              >
                {statusLabel}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-40" />
                </>
              ) : (
                <>
                  <div className="text-3xl leading-none tracking-tight">{formatGHS(stats?.netRevenue)}</div>
                  <p className="text-muted-foreground text-xs">
                    {stats?.platformFee != null
                      ? `After ${formatGHS(stats.platformFee)} platform fee`
                      : "After platform fees"}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
