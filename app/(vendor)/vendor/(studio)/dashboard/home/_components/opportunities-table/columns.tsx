"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { OpportunityRow } from "./schema";

const activityStripSlots = Array.from({ length: 18 }, (_, index) => ({
  id: `strip-${index + 1}`,
  threshold: index + 1,
}));

function getActivityScore(activity: OpportunityRow["activity"]) {
  switch (activity) {
    case "Active":
      return 18;
    case "Expiring Soon":
      return 11;
    case "No Bids":
      return 7;
    case "Withdrawn":
      return 4;
    default:
      return 0;
  }
}

export const opportunitiesColumns: ColumnDef<OpportunityRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all lots"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.title}`}
      />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Lot ID",
    cell: ({ row }) => <div className="text-sm tracking-tight">{row.original.id}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Lot Title",
    cell: ({ row }) => (
      <div className="max-w-64 truncate font-medium text-sm" title={row.original.title}>
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const styles = {
        Live: "border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-400",
        Scheduled: "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/40 dark:bg-amber-500/15 dark:text-amber-400",
        Ended: "border-border bg-muted/60 text-muted-foreground",
        Draft: "border-border bg-muted/60 text-muted-foreground",
      } as Record<string, string>;
      return (
        <Badge variant="outline" className={cn("rounded-full px-2.5", styles[status] ?? "")}>
          {status}
        </Badge>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "bids",
    header: "Bids",
    cell: ({ row }) => <div className="text-sm tabular-nums">{row.original.bids}</div>,
  },
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => (
      <div className="flex items-end gap-0.5" title={row.original.activity}>
        <span className="sr-only">{row.original.activity}</span>
        {activityStripSlots.map((slot) => (
          <div
            key={`${row.original.id}-${slot.id}`}
            className={cn(
              "h-5 w-1 rounded-full",
              slot.threshold <= getActivityScore(row.original.activity) ? "bg-green-500/85" : "bg-green-500/15",
            )}
          />
        ))}
      </div>
    ),
    filterFn: "equalsString",
  },
  {
    accessorKey: "currentBid",
    header: "Current Bid",
    cell: ({ row }) => <div className="font-medium text-sm tabular-nums">{row.original.currentBid}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Edit</div>,
    cell: () => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:bg-transparent focus-visible:bg-transparent"
        >
          <Pencil />
          <span className="sr-only">Edit lot</span>
        </Button>
      </div>
    ),
    enableHiding: false,
  },
];
