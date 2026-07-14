"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDisputeStatus, type Dispute } from "../../_logics/disputes";
import { useDisputableLots } from "../../_logics/useReceipts";
import { useDisputes } from "../../_logics/useDisputes";
import FileDisputeDialog from "./file-dispute-dialog";
import DisputeThread from "./dispute-thread";
import { disputeStatusBadge, isDisputeOpen, isDisputeResolved } from "./dispute-utils";

const PAGE_SIZE = 20;

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DisputeRow({
  dispute,
  expanded,
  threadCount,
  onToggle,
  onMessageCount,
}: {
  dispute: Dispute;
  expanded: boolean;
  threadCount: number;
  onToggle: () => void;
  onMessageCount: (count: number) => void;
}) {
  const date = format(parseISO(dispute.filedAt ?? dispute.createdAt), "d MMM yyyy");

  return (
    <div className="w-full border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 bg-white hover:bg-white transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F0F2F5]">
            <MessageSquare className="size-4 text-[#657688]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-semibold text-[#2A3239] truncate">
              {dispute.lotTitle ?? `Lot #${dispute.lotId}`}
            </p>
            <p className="text-xs text-[#657688] mt-0.5 truncate">
              {dispute.reason} · {date}
            </p>
            {dispute.description && !expanded && (
              <p className="text-xs text-[#98A2B3] mt-1 line-clamp-1">{dispute.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span
            className={cn(
              "hidden sm:inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium pointer-events-none",
              disputeStatusBadge(dispute.status),
            )}
          >
            {formatDisputeStatus(dispute.status)}
          </span>
          {threadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#344054] text-white text-[10px] font-semibold pointer-events-none">
              {threadCount}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="size-4 text-[#657688]" />
          ) : (
            <ChevronDown className="size-4 text-[#657688]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F0F2F5]">
          <div className="px-4 sm:px-5 py-3 bg-white border-b border-[#F0F2F5] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex sm:hidden px-2 py-0.5 rounded-full border text-[10px] font-medium pointer-events-none",
                  disputeStatusBadge(dispute.status),
                )}
              >
                {formatDisputeStatus(dispute.status)}
              </span>
              {dispute.lotId > 0 && (
                <Link
                  href={`/bidder/product/${dispute.lotId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#344054] hover:underline"
                >
                  View item
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </div>
            <p className="text-xs text-[#98A2B3]">Tap the row above to collapse</p>
          </div>

          <DisputeThread
            key={dispute.id}
            disputeId={dispute.id}
            embedded
            onMessageCount={onMessageCount}
          />
        </div>
      )}
    </div>
  );
}

function DisputesFilters({
  search,
  onSearchChange,
  tab,
  onTabChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  tab: "open" | "resolved";
  onTabChange: (tab: "open" | "resolved") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#98A2B3]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search disputes"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7EC] bg-white text-sm text-[#344054] placeholder:text-[#98A2B3] outline-none focus:border-[#344054]"
        />
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-[#F0F2F5] shrink-0">
        {(["open", "resolved"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === key
                ? "bg-white text-[#2A3239] hover:bg-white"
                : "text-[#657688] hover:text-[#344054] hover:bg-white",
            )}
          >
            {key === "open" ? "Open" : "Resolved"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Disputes() {
  const [page] = useState(1);
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [messageCounts, setMessageCounts] = useState<Record<number, number>>({});

  const { data, isLoading, error, refetch } = useDisputes({ page, limit: PAGE_SIZE });
  const { lots: disputableLots, isLoading: lotsLoading } = useDisputableLots();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<{ lotId: number; lotTitle: string } | null>(null);

  const disputes = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return disputes.filter((d) => {
      const matchesTab = tab === "open" ? isDisputeOpen(d.status) : isDisputeResolved(d.status);
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        d.reason.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false) ||
        (d.lotTitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [disputes, tab, search]);

  function getThreadCount(dispute: Dispute) {
    return messageCounts[dispute.id] ?? dispute.messageCount ?? 0;
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function openFileDialog(lotId: number, lotTitle: string) {
    setSelectedLot({ lotId, lotTitle });
    setPickerOpen(false);
    setFileDialogOpen(true);
  }

  function handleFileNewDispute() {
    if (disputableLots.length === 1) {
      openFileDialog(disputableLots[0].id, disputableLots[0].title);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#657688]">
            Expand a dispute to read messages and reply to support.
          </p>
          <button
            type="button"
            onClick={handleFileNewDispute}
            disabled={lotsLoading || disputableLots.length === 0}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#344054] text-white text-sm font-medium hover:bg-[#1D2939] disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="size-4" />
            File dispute
          </button>
        </div>

        <DisputesFilters
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={(next) => {
            setTab(next);
            setExpandedId(null);
          }}
        />

        {isLoading ? (
          <div className="flex flex-col gap-3 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-full rounded-[16px] bg-[#F0F2F5] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center border border-[#F0F2F5] rounded-[16px] bg-white">
            <AlertCircle className="size-8 text-[#98A2B3]" />
            <p className="text-sm text-[#657688]">
              No {tab === "open" ? "open" : "resolved"} disputes
              {search ? " matching your search" : ""}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {filtered.map((dispute) => (
              <DisputeRow
                key={dispute.id}
                dispute={dispute}
                expanded={expandedId === dispute.id}
                threadCount={getThreadCount(dispute)}
                onToggle={() => toggleExpand(dispute.id)}
                onMessageCount={(count) =>
                  setMessageCounts((prev) => ({ ...prev, [dispute.id]: count }))
                }
              />
            ))}
          </div>
        )}
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
                onClick={() => openFileDialog(lot.id, lot.title)}
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
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        lotId={selectedLot?.lotId ?? null}
        lotTitle={selectedLot?.lotTitle}
        onSuccess={() => {
          refetch();
          setTab("open");
        }}
      />
    </>
  );
}
