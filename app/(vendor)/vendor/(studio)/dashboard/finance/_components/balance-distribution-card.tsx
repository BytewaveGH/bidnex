"use client";

import * as React from "react";

import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useEarningsBreakdown } from "../_logics/useEarningsBreakdown";

const chartConfig = {
  amount: { label: "Amount" },
  gross: { color: "var(--chart-2)", label: "Gross Sales" },
  fees: { color: "var(--chart-1)", label: "Platform Fees" },
  net: { color: "var(--chart-3)", label: "Net Earnings" },
} satisfies ChartConfig;

const currencies = {
  GHS: { label: "GHS Balance" },
  USD: { label: "USD Balance" },
} as const;

type Currency = keyof typeof currencies;

const COLORS: Record<string, string> = {
  gross: "var(--chart-2)",
  fees: "var(--chart-1)",
  net: "var(--chart-3)",
};

function formatGHS(amount: number, currency: Currency) {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `GHS ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isGrossItem(key: string, label: string) {
  return key === "gross" || label.toLowerCase().includes("gross");
}

export function BalanceDistributionCard() {
  const [currency, setCurrency] = React.useState<Currency>("GHS");
  const { data, isLoading } = useEarningsBreakdown(currency);

  const items = (data ?? []).filter((item) => item.currency === currency);
  const grossItem = items.find((item) => isGrossItem(item.key, item.label));
  const feeItem = items.find((item) => item.key === "fees");
  const netItem = items.find((item) => item.key === "net");
  const total = grossItem?.amount ?? (feeItem && netItem ? feeItem.amount + netItem.amount : 0);

  const chartData = items
    .filter((item) => !isGrossItem(item.key, item.label) && item.amount > 0)
    .map((item) => ({
      account: item.label,
      amount: item.amount,
      key: item.key,
      fill: COLORS[item.key] ?? "var(--chart-4)",
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Earnings Breakdown</CardTitle>
        <CardAction>
          <Select onValueChange={(value) => setCurrency(value as Currency)} value={currency}>
            <SelectTrigger className="w-36" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(currencies).map(([value, item]) => (
                  <SelectItem key={value} value={value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        {isLoading ? (
          <>
            <Skeleton className="mx-auto aspect-square h-50 rounded-full" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 2 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </>
        ) : items.length === 0 ? (
          <div className="col-span-full flex h-50 items-center justify-center text-muted-foreground text-sm">
            No earnings data available.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-50">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="w-52"
                      nameKey="account"
                      formatter={(value) => formatGHS(Number(value), currency)}
                    />
                  }
                />
                <Pie
                  cornerRadius={6}
                  data={chartData}
                  dataKey="amount"
                  innerRadius={65}
                  nameKey="account"
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) return null;
                      return (
                        <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                          <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy ?? 0) - 8}>
                            Total
                          </tspan>
                          <tspan
                            className="fill-foreground font-medium text-lg tabular-nums"
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                          >
                            {formatGHS(total, currency)}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex min-w-0 flex-col gap-3">
              <div className="grid grid-cols-[1fr_auto] items-end gap-3 border-border/60 border-b pb-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="font-medium tabular-nums">{formatGHS(total, currency)}</p>
                </div>
                <div className="font-medium tabular-nums">100.0%</div>
              </div>

              {chartData.map((item) => {
                const breakdownItem = items.find((entry) => entry.key === item.key);
                const pct = breakdownItem?.percent ?? (total > 0 ? (item.amount / total) * 100 : 0);

                return (
                  <div className="grid grid-cols-[1fr_auto] items-end gap-3" key={item.key}>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1">
                        <span
                          aria-hidden="true"
                          className="h-2 w-1 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <p className="truncate text-muted-foreground text-xs">{item.account}</p>
                      </div>
                      <p className="font-medium tabular-nums">{formatGHS(item.amount, currency)}</p>
                    </div>
                    <div className="font-medium tabular-nums">{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
