"use client";

import { useState } from "react";

import { AwaitingPaymentCard } from "./awaiting-payment-card";
import { Inventory } from "./inventory";
import { KpiStrip } from "./kpi-strip";
import { NewProductSheet } from "./new-product-sheet";
import { RecentOrders } from "./recent-orders";
import { StatusCreateLot } from "./status-create-lot";
import { TopProducts } from "./top-products";

type LotsPageContentProps = {
  formattedDate: string;
};

export function LotsPageContent({ formattedDate }: LotsPageContentProps) {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Lots/Products Overview</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <StatusCreateLot onSuccess={() => setRefreshToken((token) => token + 1)} />
          <NewProductSheet onSuccess={() => setRefreshToken((token) => token + 1)} />
        </div>
      </div>

      {/* <KpiStrip /> */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <TopProducts />
        </div>
        <div className="xl:col-span-4">
          <Inventory />
        </div>
        {/* <div className="xl:col-span-4">
          <AwaitingPaymentCard />
        </div> */}
        <div className="xl:col-span-12">
          <RecentOrders refreshToken={refreshToken} />
        </div>
      </div>
    </div>
  );
}
