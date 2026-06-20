"use client";

import Image from "next/image";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useLotsAwaitingPayment } from "../_logics/useLotsAwaitingPayment";

export function AwaitingPaymentCard() {
  const { data, isLoading, error } = useLotsAwaitingPayment(1);

  const lots = data?.lots ?? [];
  const currency = data?.currency ?? "GHS";
  const totalExpected = data?.totalExpected ?? 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Awaiting Payment</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? (
            <Skeleton className="h-6 w-36" />
          ) : error ? (
            "—"
          ) : (
            `${currency} ${totalExpected.toLocaleString("en-US")}`
          )}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </>
        ) : error ? (
          <p className="text-muted-foreground text-sm">Failed to load awaiting payment lots.</p>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              <span className="font-medium text-foreground">{lots.length}</span> lot{lots.length === 1 ? "" : "s"}{" "}
              awaiting buyer payment
            </p>

            <div className="flex flex-col gap-2">
              {lots.length ? (
                lots.map((lot) => {
                  const dueDate = lot.paymentDueAt ? format(new Date(lot.paymentDueAt), "MMM dd, yyyy") : "—";

                  return (
                    <div key={lot.id} className="rounded-lg border px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          {lot.primaryImageUrl ? (
                            <Image
                              alt=""
                              className="size-10 shrink-0 rounded-md object-cover"
                              height={40}
                              src={lot.primaryImageUrl}
                              width={40}
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-sm">{lot.title}</p>
                            <p className="mt-1 text-muted-foreground text-xs">
                              {lot.currency} {lot.amount.toLocaleString("en-US")} &bull; Due {dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 size-2 shrink-0 rounded-full bg-yellow-500" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">No lots awaiting payment.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
