"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import {
  formatChartPeriodTick,
  formatChartPeriodTooltip,
  useRevenueChart,
  type RevenueChartRange,
} from "../_logics/useRevenueChart";

const chartConfig = {
  revenue: {
    color: "var(--chart-2)",
    label: "Revenue",
  },
} satisfies ChartConfig;

const RANGE_LABELS: Record<RevenueChartRange, string> = {
  weekly: "Days this week",
  monthly: "Weeks this month",
  yearly: "Months this year",
};

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TransactionsOverviewCard() {
  const [range, setRange] = useState<RevenueChartRange>("monthly");
  const { data: chartItems, isLoading, isFetching } = useRevenueChart(range);

  const chartData = useMemo(
    () =>
      (chartItems ?? []).map((item) => ({
        period: item.period,
        revenue: item.revenue,
        lots: item.lots,
      })),
    [chartItems],
  );

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalLots = chartData.reduce((sum, item) => sum + item.lots, 0);
  const showSkeleton = isLoading || (isFetching && chartData.length === 0);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="font-normal">Revenue Overview</CardTitle>
          {!showSkeleton && chartData.length > 0 && (
            <CardDescription>
              {formatGHS(totalRevenue)} total · {totalLots} lot{totalLots === 1 ? "" : "s"} sold · {RANGE_LABELS[range]}
            </CardDescription>
          )}
        </div>
        <CardAction>
          <Select value={range} onValueChange={(value) => setRange(value as RevenueChartRange)}>
            <SelectTrigger className="w-28" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {showSkeleton ? (
          <Skeleton className="h-50 w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-50 items-center justify-center text-muted-foreground text-sm">
            No revenue data for this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-50 w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ bottom: 0, left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="period"
                interval={0}
                minTickGap={8}
                tickFormatter={(value) => formatChartPeriodTick(String(value), range)}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => formatGHS(Number(value))}
                tickLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                width={88}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const point = payload[0]?.payload as { period: string; revenue: number; lots: number };

                  return (
                    <div className="grid min-w-36 gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">{formatChartPeriodTooltip(point.period, range)}</p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium tabular-nums">{formatGHS(point.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Lots sold</span>
                        <span className="font-medium tabular-nums">{point.lots}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" maxBarSize={48} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
