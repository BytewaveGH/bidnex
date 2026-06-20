"use client";

import { ArrowUpRight } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useLotsTop } from "../_logics/useLotsTop";

export function TopProducts() {
  const { data, isLoading, error } = useLotsTop(3);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Top Performing Lots</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Skeleton className="h-6 w-32" /> : error ? "—" : (data?.headline ?? "—")}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-2 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Separator />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </>
        ) : error ? (
          <p className="text-muted-foreground text-sm">Failed to load top lots.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div aria-label="Sales by category" className="flex h-2 gap-1 overflow-hidden bg-muted" role="img">
                {(data?.categories ?? []).map((category) => (
                  <div
                    aria-hidden="true"
                    key={category.name}
                    className="rounded-md"
                    style={{
                      backgroundColor: category.color,
                      width: `${category.share}%`,
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                {(data?.categories ?? []).map((category) => (
                  <div className="flex items-center gap-1" key={category.name}>
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-muted-foreground text-xs">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
              <div className="text-muted-foreground text-xs">Lot</div>
              <div className="text-muted-foreground text-xs">Bids</div>
              <div className="text-muted-foreground text-xs">Top Bid</div>

              {(data?.products ?? []).length ? (
                data?.products.map((product) => (
                  <div className="contents text-sm" key={product.id}>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{product.name}</div>
                      <div className="text-muted-foreground text-xs">{product.category}</div>
                    </div>
                    <div className="self-center text-muted-foreground tabular-nums">{product.bids}</div>
                    <div className="self-center font-medium tabular-nums">{product.topBid}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-muted-foreground text-sm">No top lots yet.</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
