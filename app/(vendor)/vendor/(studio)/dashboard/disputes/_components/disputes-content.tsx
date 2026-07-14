"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { AlertCircle, ChevronDown, ChevronUp, MessageSquare, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type Dispute } from "@/app/(bidder)/bidder/(billing)/_logics/disputes";
import { useVendorDisputes } from "../_logics/useVendorDisputes";
import { VendorDisputeThread } from "./dispute-thread";
import { disputeStatusBadge, formatDisputeStatus } from "./dispute-utils";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under review" },
  { value: "resolved_refund", label: "Resolved (refund)" },
  { value: "resolved_no_action", label: "Resolved (no action)" },
] as const;

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
    <div className="overflow-hidden rounded-xl border bg-background">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-background sm:px-5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-muted">
            <MessageSquare className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold sm:text-base">
              {dispute.lotTitle ?? `Lot #${dispute.lotId}`}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {dispute.reason} · {date}
            </p>
            {dispute.description && !expanded && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">{dispute.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className={cn("hidden px-2 py-0.5 text-[10px] font-medium sm:inline-flex pointer-events-none", disputeStatusBadge(dispute.status))}
          >
            {formatDisputeStatus(dispute.status)}
          </Badge>
          {threadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground pointer-events-none">
              {threadCount}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          <div className="flex flex-wrap items-center gap-2 border-b bg-background px-4 py-2 sm:px-5">
            <Badge
              variant="outline"
              className={cn("inline-flex px-2 py-0.5 text-[10px] font-medium sm:hidden pointer-events-none", disputeStatusBadge(dispute.status))}
            >
              {formatDisputeStatus(dispute.status)}
            </Badge>
            <span className="text-xs text-muted-foreground">Tap the row above to collapse</span>
          </div>
          <VendorDisputeThread disputeId={dispute.id} onMessageCount={onMessageCount} />
        </div>
      )}
    </div>
  );
}

export function DisputesContent() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [messageCounts, setMessageCounts] = useState<Record<number, number>>({});

  const apiStatus = status === "all" ? undefined : status;
  const { data, isLoading, error } = useVendorDisputes({
    page,
    limit: PAGE_SIZE,
    status: apiStatus,
  });

  const disputes = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return disputes;
    return disputes.filter(
      (d) =>
        d.reason.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false) ||
        (d.lotTitle?.toLowerCase().includes(q) ?? false),
    );
  }, [disputes, search]);

  function getThreadCount(dispute: Dispute) {
    return messageCounts[dispute.id] ?? dispute.messageCount ?? 0;
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search disputes"
            className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:border-ring"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
            setExpandedId(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-background py-16 text-center">
          <AlertCircle className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No disputes found{search ? " matching your search" : ""}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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

      {data && data.count > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {data.count} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => {
                setPage((p) => p - 1);
                setExpandedId(null);
              }}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => {
                setPage((p) => p + 1);
                setExpandedId(null);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
