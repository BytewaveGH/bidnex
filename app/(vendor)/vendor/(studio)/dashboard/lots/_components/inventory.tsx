"use client";

import { ArrowUpRight, CircleCheck, CircleDashed, CircleX, Clock } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useLotsStatusSummary } from "../_logics/useLotsStatusSummary";

const chartConfig = {
  approved: {
    label: "Approved",
    color: "var(--chart-2)",
  },
  submitted: {
    label: "Submitted",
    color: "var(--chart-1)",
  },
  draft: {
    label: "Draft",
    color: "var(--chart-4)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

const gaugeSegmentCount = 32;
const gaugeOrder = ["approved", "submitted", "draft", "rejected"] as const;

export function Inventory() {
  const { data, isLoading, error } = useLotsStatusSummary();

  const approved = data?.approved ?? 0;
  const submitted = data?.submitted ?? 0;
  const draft = data?.draft ?? 0;
  const rejected = data?.rejected ?? 0;
  const totalUnits = data?.total ?? approved + submitted + draft + rejected;
  const approvedPercent = totalUnits > 0 ? Math.round((approved / totalUnits) * 100) : 0;

  const counts = { approved, submitted, draft, rejected };
  const segmentCounts = gaugeOrder.map((status) =>
    totalUnits > 0 ? Math.round((counts[status] / totalUnits) * gaugeSegmentCount) : 0,
  );

  const gaugeSegments = Array.from({ length: gaugeSegmentCount }, (_, index) => {
    let cumulative = 0;
    let status: (typeof gaugeOrder)[number] = gaugeOrder[gaugeOrder.length - 1];
    for (let i = 0; i < gaugeOrder.length; i++) {
      cumulative += segmentCounts[i];
      if (index < cumulative) {
        status = gaugeOrder[i];
        break;
      }
    }

    return {
      fill: `var(--color-${status})`,
      id: `segment-${index + 1}`,
      status,
      value: 1,
    };
  });

  const inventorySummary = [
    { icon: CircleDashed, label: "Draft", value: draft },
    { icon: Clock, label: "Submitted", value: submitted },
    { icon: CircleCheck, label: "Approved", value: approved },
    { icon: CircleX, label: "Rejected", value: rejected },
  ] as const;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Lot Status</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Skeleton className="h-6 w-24" /> : error ? "—" : `${approvedPercent}% approved`}
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
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
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
                              {approvedPercent}%
                            </tspan>
                            <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 38}>
                              Approved
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

            <div className="grid grid-cols-4 divide-x">
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
