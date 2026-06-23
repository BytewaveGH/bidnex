"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useBidActivity } from "../_logics/useBidActivity";
import { useDashboardStats } from "../_logics/useDashboardStats";

const bidChartConfig = {
  bids: {
    label: "Bids",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const axisMonthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const tooltipMonthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });

export function PipelineActivity() {
  const { data: activityData, isLoading: activityLoading } = useBidActivity();
  const { data: dashStats, isLoading: statsLoading } = useDashboardStats();

  const bidChartData = (activityData ?? []).map((item) => ({
    date: new Date(item.period + "-01").toISOString(),
    bids: item.bids,
  }));

  const totalBids = bidChartData.reduce((sum, item) => sum + (Number(item.bids) || 0), 0);
  const auctionsClosed = dashStats?.closedAuctions ?? 0;
  const closeProgress = totalBids > 0 ? Math.min(100, Math.round((auctionsClosed / totalBids) * 100)) : 0;

  const isLoading = activityLoading || statsLoading;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-12">
        <CardHeader>
          <CardTitle>Bid Activity</CardTitle>
          <CardAction>
            <Select defaultValue="last-12-months">
              <SelectTrigger size="sm" className="min-w-40">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-quarter">Last quarter</SelectItem>
                  <SelectItem value="last-12-months">Last 12 months</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {isLoading ? (
              <div className="flex h-72 items-end gap-1 px-2 lg:col-span-8">
                {Array.from({ length: 12 }, (_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${40 + (i % 5) * 12}%` }} />
                ))}
              </div>
            ) : (
              <ChartContainer config={bidChartConfig} className="h-72 w-full lg:col-span-8">
                <BarChart data={bidChartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }} barSize={38}>
                    <defs>
                      <pattern
                        id="crm-qualified-pattern"
                        width="4"
                        height="4"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)"
                      >
                        <rect width="6" height="6" fill="var(--color-bids)" fillOpacity="0.15" />
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="6"
                          stroke="var(--color-bids)"
                          strokeWidth="1.25"
                          strokeOpacity="0.40"
                        />
                      </pattern>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="0" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => axisMonthFormatter.format(new Date(String(value)))}
                    />
                    <YAxis hide />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideIndicator
                          labelFormatter={(value) => tooltipMonthFormatter.format(new Date(String(value)))}
                        />
                      }
                    />
                    <Bar
                      dataKey="bids"
                      fill="url(#crm-qualified-pattern)"
                      radius={[8, 8, 0, 0]}
                      stroke="var(--color-bids)"
                      strokeOpacity={0.5}
                      strokeWidth={0.5}
                    />
                </BarChart>
              </ChartContainer>
            )}

            <div className="flex flex-col gap-5 rounded-lg p-4 lg:col-span-4">
              <div className="flex flex-col gap-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </>
                ) : (
                  <>
                    <div className="font-medium text-4xl tabular-nums leading-none">
                      {totalBids} <span className="font-normal text-lg text-muted-foreground">bids</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Total bids placed across all lots over the last 12 months.</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-3">
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest">
                  Auctions Closed
                </div>

                <div className="flex flex-col gap-1.5">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-2xl tabular-nums leading-none">
                        {auctionsClosed} <span className="font-normal text-muted-foreground text-sm">lots sold</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {closeProgress}% of total bids resulted in a closed sale.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                  <Progress
                    value={closeProgress}
                    className="h-2.5 bg-chart-2/12 *:data-[slot='progress-indicator']:bg-chart-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-medium tabular-nums">{auctionsClosed} closed</div>
                    <div className="text-muted-foreground tabular-nums">{totalBids} total bids</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
