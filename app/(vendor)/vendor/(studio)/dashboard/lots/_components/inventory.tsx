"use client";

import { ArrowUpRight, CircleCheck, CircleDashed, CircleX } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useLotsStatusSummary } from "../_logics/useLotsStatusSummary";

const chartConfig = {
  active: {
    label: "Active",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending Review",
    color: "var(--chart-1)",
  },
  ended: {
    label: "Ended",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

const gaugeSegmentCount = 32;

export function Inventory() {
  const { data, isLoading, error } = useLotsStatusSummary();

  const active = data?.active ?? 0;
  const pending = data?.pendingReview ?? 0;
  const ended = data?.ended ?? 0;
  const totalUnits = data?.total ?? active + pending + ended;
  const availablePercent = totalUnits > 0 ? Math.round((active / totalUnits) * 100) : 0;

  const activeSegments = totalUnits > 0 ? Math.round((active / totalUnits) * gaugeSegmentCount) : 0;
  const pendingSegments = totalUnits > 0 ? Math.round((pending / totalUnits) * gaugeSegmentCount) : 0;

  const gaugeSegments = Array.from({ length: gaugeSegmentCount }, (_, index) => {
    const status =
      index < activeSegments ? "active" : index < activeSegments + pendingSegments ? "pending" : "ended";

    return {
      fill: `var(--color-${status})`,
      id: `segment-${index + 1}`,
      status,
      value: 1,
    };
  });

  const inventorySummary = [
    { icon: CircleCheck, label: "Active", value: active },
    { icon: CircleDashed, label: "Pending", value: pending },
    { icon: CircleX, label: "Ended", value: ended },
  ] as const;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Lot Status</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Skeleton className="h-6 w-24" /> : error ? "—" : `${availablePercent}% active`}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="mx-auto h-30 w-full" />
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="mx-auto h-16 w-16 rounded-full" />
              ))}
            </div>
          </>
        ) : error ? (
          <p className="text-muted-foreground text-sm">Failed to load lot status.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto h-30 w-full">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="100%"
                  cornerRadius={6}
                  data={gaugeSegments}
                  dataKey="value"
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  startAngle={180}
                  stroke="var(--card)"
                  strokeWidth={1}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                            <tspan
                              className="fill-foreground font-medium text-2xl tabular-nums"
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                            >
                              {availablePercent}%
                            </tspan>
                            <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 38}>
                              Active
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <Separator />

            <div className="grid grid-cols-3 divide-x">
              {inventorySummary.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-3 text-center">
                  <div className="grid size-9 place-items-center rounded-full bg-muted">
                    <item.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs leading-none">{item.label}</div>
                    <div className="font-medium text-sm tabular-nums">{item.value.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
