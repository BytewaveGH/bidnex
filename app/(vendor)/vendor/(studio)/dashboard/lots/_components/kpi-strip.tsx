"use client";

import { format, parse } from "date-fns";
import { AlertCircle, ArrowUpRight, BadgeCheck, DollarSign, Gavel, PackageCheck, Users } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

import { useLotsStats, type LotsStatsMetric } from "../_logics/useLotsStats";

const revenueBucketRanges = ["01-05", "06-10", "11-15", "16-20", "21-25", "26-31"] as const;

const revenueBucketValues = [
  [4820, 5150, 5060, 5520, 5990, 6880],
  [5140, 5360, 5520, 5860, 6120, 6720],
  [4920, 4680, 5150, 5360, 5720, 6150],
  [5480, 5920, 5660, 6180, 6340, 6660],
  [5840, 6220, 6480, 6110, 6680, 7230],
  [6280, 6740, 6960, 7120, 6780, 7240],
  [6820, 7240, 7680, 7410, 7920, 7810],
  [6040, 6420, 6150, 6860, 7080, 7090],
  [5860, 6120, 6340, 6080, 6620, 6900],
  [6520, 6840, 7060, 7420, 7160, 8280],
  [6980, 7320, 7640, 7160, 8040, 8620],
  [6900, 7400, 8100, 8600, 8200, 9360],
] as const;

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function getRollingRevenueBuckets() {
  const currentMonth = new Date();
  currentMonth.setDate(1);

  return revenueBucketValues.map((values, index) => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(currentMonth.getMonth() - (revenueBucketValues.length - 1 - index));

    return {
      month: `${monthFormatter.format(monthDate)} ${String(monthDate.getFullYear()).slice(-2)}`,
      values,
    };
  });
}

const revenueOverviewData = getRollingRevenueBuckets().flatMap(({ month, values }) =>
  values.map((revenue, index) => ({
    period: `${month} ${revenueBucketRanges[index]}`,
    profit: Math.round(revenue * (index % 3 === 0 ? 0.24 : index % 3 === 1 ? 0.28 : 0.26)),
    revenue,
  })),
);

const revenueOverviewConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--foreground)",
  },
  profit: {
    label: "Profit",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatMonthTick(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parts.slice(0, -1).join(" ");

  return range === "11-15" ? month : "";
}

function formatTooltipLabel(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parse(parts.slice(0, -1).join(" "), "MMM yy", new Date());
  const [start, end] = String(range).split("-");
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDate = new Date(month.getFullYear(), month.getMonth(), Number(start));
  const endDate = new Date(month.getFullYear(), month.getMonth(), Math.min(Number(end), lastDayOfMonth));

  return `${format(month, "MMM")} ${format(startDate, "do")} - ${format(endDate, "do")}, ${format(month, "yyyy")}`;
}

function formatCurrencyTooltipValue(value: unknown) {
  return typeof value === "number" ? `$${value.toLocaleString()}` : String(value ?? "");
}

function formatMetricValue(metric: LotsStatsMetric | undefined, options?: { suffix?: string; currency?: string }) {
  if (!metric || metric.value == null) return "—";
  const prefix = options?.currency ?? "";
  const suffix = options?.suffix ?? "";
  return `${prefix}${metric.value.toLocaleString("en-US")}${suffix}`;
}

function formatChange(metric: LotsStatsMetric | undefined) {
  if (!metric) return { text: "—", positive: true };

  if (metric.changePercent !== undefined) {
    const positive = metric.changePercent >= 0;
    return {
      text: `${positive ? "+" : ""}${metric.changePercent.toFixed(1)}%`,
      positive,
    };
  }

  if (metric.changePoints !== undefined) {
    const positive = metric.changePoints >= 0;
    return {
      text: `${positive ? "+" : ""}${metric.changePoints.toFixed(1)} pts`,
      positive,
    };
  }

  if (metric.changeAbsolute !== undefined) {
    const positive = metric.changeAbsolute >= 0;
    const prefix = metric.currency ? `${metric.currency} ` : "";
    return {
      text: `${positive ? "+" : "-"}${prefix}${Math.abs(metric.changeAbsolute).toLocaleString("en-US")}`,
      positive,
    };
  }

  return { text: "—", positive: true };
}

function MetricChange({ metric }: { metric: LotsStatsMetric | undefined }) {
  const change = formatChange(metric);
  return (
    <div className="text-sm">
      <span className={change.positive ? "text-green-700 dark:text-green-300" : "text-destructive"}>
        {change.text}
      </span>
      <span className="text-muted-foreground"> vs last month</span>
    </div>
  );
}

export function KpiStrip() {
  const { data: stats, isLoading } = useLotsStats();

  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-12">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Auction Revenue</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? (
                    <Skeleton className="h-8 w-40" />
                  ) : (
                    formatMetricValue(stats?.auctionRevenue, {
                      currency: `${stats?.auctionRevenue?.currency ?? "GHS"} `,
                    })
                  )}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <DollarSign className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-28" /> : <MetricChange metric={stats?.auctionRevenue} />}
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Lots Submitted</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : formatMetricValue(stats?.lotsSubmitted)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Gavel className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-20" /> : <MetricChange metric={stats?.lotsSubmitted} />}
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Unique Bidders</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : formatMetricValue(stats?.uniqueBidders)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Users className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-24" /> : <MetricChange metric={stats?.uniqueBidders} />}
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Avg. Reserve Price</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatMetricValue(stats?.avgReservePrice, {
                      currency: `${stats?.avgReservePrice?.currency ?? "GHS"} `,
                    })
                  )}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <PackageCheck className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-24" /> : <MetricChange metric={stats?.avgReservePrice} />}
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r md:border-b-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Open Disputes</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : formatMetricValue(stats?.openDisputes)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <AlertCircle className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-16" /> : <MetricChange metric={stats?.openDisputes} />}
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Approval Rate</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    formatMetricValue(stats?.approvalRate, { suffix: "%" })
                  )}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <BadgeCheck className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-4 w-24" /> : <MetricChange metric={stats?.approvalRate} />}
              </CardContent>
            </Card>
          </div>

          <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
            <CardHeader>
              <CardTitle className="font-normal">Revenue Overview</CardTitle>
              <CardAction>
                <ArrowUpRight className="size-4" />
              </CardAction>
            </CardHeader>

            <CardContent>
              <ChartContainer config={revenueOverviewConfig} className="h-74 w-full">
                <ComposedChart
                  accessibilityLayer
                  data={revenueOverviewData}
                  margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                >
                  <defs>
                    <filter id="sales-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="var(--color-revenue)" floodOpacity="0.35" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid yAxisId="profit" vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    height={30}
                    interval={0}
                    minTickGap={0}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatMonthTick(String(value))}
                  />
                  <YAxis yAxisId="revenue" hide domain={[3000, 10_000]} />
                  <YAxis yAxisId="profit" hide domain={[0, 6000]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => formatTooltipLabel(String(value))}
                        formatter={(value, name, item) => (
                          <>
                            <div
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <div className="flex flex-1 items-center justify-between leading-none">
                              <span className="text-muted-foreground">{String(name ?? "")}</span>
                              <span className="font-medium font-mono text-foreground tabular-nums">
                                {formatCurrencyTooltipValue(value)}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                    cursor={{
                      stroke: "var(--border)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Bar
                    yAxisId="profit"
                    barSize={4}
                    dataKey="profit"
                    fill="var(--color-profit)"
                    name="Profit"
                    opacity={0.18}
                    radius={[6, 6, 0, 0]}
                  />
                  <Area
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="none"
                    filter="url(#sales-line-glow)"
                    name="Revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.8}
                    type="linear"
                    activeDot={{
                      r: 4,
                      fill: "var(--background)",
                      stroke: "var(--color-revenue)",
                      strokeWidth: 2,
                    }}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
