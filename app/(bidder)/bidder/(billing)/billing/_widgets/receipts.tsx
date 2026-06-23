"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Receipt as ReceiptIcon } from "lucide-react";

import { useReceipts, type Receipt } from "../../_logics/useReceipts";

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F0F2F5]">
            <ReceiptIcon className="size-4 text-[#657688]" />
          </div>
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-[#2A3239]">
              {formatGHS(receipt.total)}
            </span>
            <span className="text-xs text-[#657688]">
              {format(parseISO(receipt.paidAt), "d MMM yyyy, h:mm a")} · Ref: {receipt.reference}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs font-medium text-[#657688]">
            {receipt.lots.length} item{receipt.lots.length > 1 ? "s" : ""}
          </span>
          {expanded
            ? <ChevronUp className="size-4 text-[#657688]" />
            : <ChevronDown className="size-4 text-[#657688]" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F0F2F5]">
          <div className="px-5 divide-y divide-[#F0F2F5]">
            {receipt.lots.map((lot) => (
              <div key={lot.id} className="flex items-start justify-between gap-4 py-3">
                <p className="text-sm text-[#344054] line-clamp-2 flex-1">{lot.title}</p>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#2A3239]">{formatGHS(lot.amount)}</p>
                  <p className="text-xs text-[#657688]">Fee: {formatGHS(lot.fee)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-[#F9FAFB] border-t border-[#F0F2F5] flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-[#657688]">
              <span>Subtotal</span>
              <span>{formatGHS(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#657688]">
              <span>Platform fee</span>
              <span>{formatGHS(receipt.fee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#2A3239] pt-1 border-t border-[#F0F2F5]">
              <span>Total paid</span>
              <span>{formatGHS(receipt.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="border border-[#F0F2F5] rounded-[16px] bg-white px-5 py-4 flex items-center gap-3">
      <div className="size-9 rounded-[8px] bg-[#F0F2F5] animate-pulse shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 bg-[#F0F2F5] animate-pulse rounded w-28" />
        <div className="h-3 bg-[#F0F2F5] animate-pulse rounded w-48" />
      </div>
    </div>
  );
}

export default function Receipts() {
  const { data: receipts, isLoading, error } = useReceipts();

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-[#D42620] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <ReceiptSkeleton key={i} />)
      ) : !receipts || receipts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#F0F2F5]">
            <ReceiptIcon className="size-6 text-[#657688]" />
          </div>
          <p className="text-[#657688] text-sm text-center">No payment history yet.</p>
        </div>
      ) : (
        receipts.map((receipt) => (
          <ReceiptCard key={receipt.reference} receipt={receipt} />
        ))
      )}
    </div>
  );
}
