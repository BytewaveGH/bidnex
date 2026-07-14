"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BILLING_USE_SAMPLE_DATA } from "@/lib/mock-bidder-billing";
import { cn } from "@/lib/utils";
import Receipts from "./receipts";
import Disputes from "./disputes";

const tabs = [
  { id: "receipts" as const, label: "Payment Receipts" },
  { id: "disputes" as const, label: "Disputes" },
];

export default function OrdersAndReturns() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "disputes" ? "disputes" : "receipts";
  const [activeTab, setActiveTab] = useState<"receipts" | "disputes">(initialTab);

  return (
    <div className="w-full flex flex-col gap-6">
      {BILLING_USE_SAMPLE_DATA && (
        <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Preview mode — sample receipts and disputes are shown.
        </p>
      )}

      <div className="flex border-b border-[#E4E7EC]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-1 pb-3 mr-6 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-[#2A3239] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2A3239]"
                : "text-[#657688] hover:text-[#344054]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === "receipts" ? <Receipts /> : <Disputes />}
      </div>
    </div>
  );
}
