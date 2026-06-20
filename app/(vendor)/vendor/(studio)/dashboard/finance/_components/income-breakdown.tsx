"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useRevenueSources } from "../_logics/useRevenueSources";

const BAR_OPACITIES = ["", "/75", "/50", "/30"];

export function IncomeBreakdown() {
  const { data: sources, isLoading } = useRevenueSources();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Revenue Sources</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <section key={i} className="isolate flex gap-[0.5px]">
                <Separator orientation="vertical" className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent" />
                <div className="flex min-h-24 flex-1 flex-col justify-between">
                  <div className="flex min-w-0 flex-col gap-2 px-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                </div>
              </section>
            ))
          : (sources ?? []).map((src, i) => (
              <section key={src.source} className="isolate flex gap-[0.5px]">
                <Separator
                  orientation="vertical"
                  className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent"
                />
                <div className="flex min-h-24 flex-1 flex-col justify-between">
                  <div className="flex min-w-0 flex-col gap-1 px-1">
                    <p className="wrap-break-word text-muted-foreground text-xs leading-none">
                      {src.label} · {src.percent}%
                    </p>
                    <div className="text-lg leading-none tracking-tight">
                      GHS{" "}
                      {src.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className={`-ml-0.5 h-5 rounded-sm bg-chart-3${BAR_OPACITIES[i] ?? "/20"}`} />
                </div>
              </section>
            ))}
      </CardContent>
    </Card>
  );
}
