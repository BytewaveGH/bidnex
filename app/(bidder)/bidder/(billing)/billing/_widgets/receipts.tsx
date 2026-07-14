"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Receipt as ReceiptIcon } from "lucide-react";

import { useReceipts, useDisputableLots, type Receipt, type ReceiptLot } from "../../_logics/useReceipts";
import FileDisputeDialog from "./file-dispute-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type DisputeTarget = {
  lotId: number;
  lotTitle: string;
};

function ReceiptCard({
  receipt,
  defaultExpanded = false,
  onFileDispute,
}: {
  receipt: Receipt;
  defaultExpanded?: boolean;
  onFileDispute: (target: DisputeTarget) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 bg-white hover:bg-white transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F0F2F5]">
            <ReceiptIcon className="size-4 text-[#657688]" />
          </div>
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="text-base font-semibold text-[#2A3239]">
              {formatGHS(receipt.total)}
            </span>
            <span className="text-xs text-[#657688]">
              {format(parseISO(receipt.paidAt), "d MMM yyyy, h:mm a")}
            </span>
            <span className="text-xs text-[#657688] truncate max-w-full">
              Ref: {receipt.reference}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs font-medium text-[#657688]">
            {receipt.lots.length} item{receipt.lots.length !== 1 ? "s" : ""}
          </span>
          {expanded
            ? <ChevronUp className="size-4 text-[#657688]" />
            : <ChevronDown className="size-4 text-[#657688]" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F0F2F5]">
          {receipt.lots.length > 0 ? (
            <div className="px-4 sm:px-5 divide-y divide-[#F0F2F5]">
              {receipt.lots.map((lot: ReceiptLot) => (
                <div key={lot.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2A3239]">{lot.title}</p>
                    <p className="text-xs text-[#657688] mt-1">
                      {formatGHS(lot.amount)} · Fee {formatGHS(lot.fee)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFileDispute({ lotId: lot.id, lotTitle: lot.title })}
                    className="h-8 px-3 rounded-lg border border-[#E4E7EC] bg-white text-xs font-medium text-[#344054] hover:bg-white whitespace-nowrap self-start sm:self-auto"
                  >
                    File dispute
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 sm:px-5 py-4">
              <p className="text-sm text-[#657688]">
                Item details are unavailable for this receipt.
              </p>
            </div>
          )}
          <div className="px-4 sm:px-5 py-3 bg-[#F9FAFB] border-t border-[#F0F2F5] flex flex-col gap-1.5">
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
  const { lots: disputableLots, isLoading: lotsLoading } = useDisputableLots();
  const [disputeTarget, setDisputeTarget] = useState<DisputeTarget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleFileDispute(target: DisputeTarget) {
    setDisputeTarget(target);
    setDialogOpen(true);
  }

  function handleFileNewDispute() {
    if (disputableLots.length === 1) {
      handleFileDispute({ lotId: disputableLots[0].id, lotTitle: disputableLots[0].title });
      return;
    }
    setPickerOpen(true);
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-[#D42620] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {!isLoading && receipts.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[#657688]">
              Tap a receipt to view items and file a dispute.
            </p>
            <button
              type="button"
              onClick={handleFileNewDispute}
              disabled={lotsLoading || disputableLots.length === 0}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#344054] text-white text-sm font-medium hover:bg-[#1D2939] disabled:opacity-50 whitespace-nowrap"
            >
              File dispute
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ReceiptSkeleton key={i} />)
        ) : receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#F0F2F5]">
              <ReceiptIcon className="size-6 text-[#657688]" />
            </div>
            <p className="text-[#657688] text-sm text-center">No payment history yet.</p>
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <ReceiptCard
              key={receipt.reference || `receipt-${index}`}
              receipt={receipt}
              defaultExpanded={index === 0}
              onFileDispute={handleFileDispute}
            />
          ))
        )}
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an item</DialogTitle>
            <DialogDescription>
              Select the paid item you want to file a dispute for.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto flex flex-col gap-2 py-2">
            {disputableLots.map((lot) => (
              <button
                key={`${lot.receiptReference}-${lot.id}`}
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  handleFileDispute({ lotId: lot.id, lotTitle: lot.title });
                }}
                className="w-full text-left border border-[#F0F2F5] rounded-[12px] px-4 py-3 bg-white hover:bg-white transition-colors"
              >
                <p className="text-sm font-medium text-[#2A3239] line-clamp-2">{lot.title}</p>
                <p className="text-xs text-[#657688] mt-1">
                  {formatGHS(lot.amount)} · Ref {lot.receiptReference}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <FileDisputeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lotId={disputeTarget?.lotId ?? null}
        lotTitle={disputeTarget?.lotTitle}
        onSuccess={() => {
          setDialogOpen(false);
        }}
      />
    </>
  );
}
