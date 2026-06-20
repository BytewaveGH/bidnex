"use client";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

import { useTrustScore } from "../_logics/useTrustScore";

export function FinanceNotification() {
  const { data, isLoading } = useTrustScore();

  const score = data?.score ?? 94;
  const percentile = data?.percentile ?? 5;

  return (
    <Item className="rounded-xl" variant="outline">
      <ItemMedia variant="icon">
        <ShieldCheck />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Seller Trust Score updated</ItemTitle>
        <ItemDescription>
          {isLoading ? (
            <Skeleton className="h-3 w-64" />
          ) : (
            `Your score is ${score} — you're in the top ${percentile}% of sellers on the platform.`
          )}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          View details
        </Button>
      </ItemActions>
    </Item>
  );
}
