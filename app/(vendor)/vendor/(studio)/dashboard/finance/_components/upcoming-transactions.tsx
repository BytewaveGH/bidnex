"use client";

import Image from "next/image";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

import { scrollToTransactionsTable } from "../_logics/finance-transactions-bridge";
import { useAwaitingPayment } from "../_logics/useAwaitingPayment";

export function UpcomingTransactions() {
  const { data, isLoading } = useAwaitingPayment(1);

  const awaitingPayment = data?.lots ?? [];
  const currency = data?.currency ?? "GHS";
  const total = data?.totalExpected ?? 0;
  const lotCount = data?.lots.length ?? awaitingPayment.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="font-normal">Awaiting Payment</CardTitle>
        {!isLoading && lotCount > 0 && (
          <Button className="h-8 px-2 text-xs" onClick={() => scrollToTransactionsTable("Pending")} variant="ghost">
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
                <span className="font-normal">
                  {currency} {total.toLocaleString("en-US")}
                </span>
              </h2>
              <p className="text-muted-foreground text-sm leading-none">
                <span className="font-medium text-foreground">{lotCount}</span> lot{lotCount === 1 ? "" : "s"} awaiting
                buyer payment
              </p>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="size-9 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ) : awaitingPayment.length === 0 ? (
          <p className="text-muted-foreground text-sm">No lots awaiting payment.</p>
        ) : (
          <ItemGroup>
            {awaitingPayment.map((lot) => {
              const dueDate = lot.paymentDueAt ? format(new Date(lot.paymentDueAt), "MMM dd, yyyy") : "—";
              return (
                <Item key={lot.id} variant="outline" size="xs">
                  <ItemMedia>
                    {lot.primaryImageUrl ? (
                      <Image
                        alt=""
                        className="size-9 rounded-md object-cover"
                        height={36}
                        src={lot.primaryImageUrl}
                        width={36}
                      />
                    ) : (
                      <div className="grid size-9 place-items-center rounded-md border bg-background">
                        <div className="size-2 rounded-full bg-yellow-500" />
                      </div>
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">{lot.title}</ItemTitle>
                    <ItemDescription>
                      {lot.currency} {(lot.amount ?? 0).toLocaleString("en-US")} &bull; Due {dueDate}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </ItemActions>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}
