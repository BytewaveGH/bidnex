import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Gavel, MoreHorizontal, Package } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { LotRow } from "./schema";

function formatDateTime(date: string) {
  return format(parseISO(date), "h:mm a, d MMM yyyy");
}

function ProductThumbnail({
  url,
  mediaType,
}: {
  url: string | null;
  mediaType?: "image" | "video";
}) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
        <Package className="size-4 text-muted-foreground" />
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <video
        src={url}
        className="size-8 shrink-0 rounded-md border object-cover"
        muted
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="size-8 shrink-0 rounded-md border object-cover"
      onError={() => setHasError(true)}
    />
  );
}

function ReviewStatusBadge({ reviewStatus }: { reviewStatus: LotRow["reviewStatus"] }) {
  if (reviewStatus === "approved") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Approved
      </Badge>
    );
  }

  if (reviewStatus === "rejected") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Rejected
      </Badge>
    );
  }

  if (reviewStatus === "draft") {
    return (
      <Badge
        className="border-muted-foreground/25 text-muted-foreground"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Draft
      </Badge>
    );
  }

  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Submitted
    </Badge>
  );
}


export function getRecentOrdersColumns({
  onSubmitForReview,
  onEditListing,
  onDeleteLot,
  submittingLotId,
}: {
  onSubmitForReview: (lotId: string) => void;
  onEditListing: (lot: LotRow) => void;
  onDeleteLot: (lot: LotRow) => void;
  submittingLotId: string | null;
}): ColumnDef<LotRow>[] {
  return [
  {
    id: "select",
    size: 68,
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all items"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          aria-label={`Select item ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "title",
    size: 244,
    header: () => <div className="w-52">Product</div>,
    cell: ({ row }) => (
      <div className="flex w-52 max-w-52 gap-3">
        <ProductThumbnail
          url={row.original.primaryImageUrl}
          mediaType={row.original.primaryMediaType}
        />
        <div className="min-w-0 flex flex-col gap-0.5">
          <div className="truncate font-medium leading-none">{row.original.title}</div>
          <div className="truncate text-muted-foreground text-xs">{row.original.condition}</div>
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.category}</span>,
  },
  {
    id: "reviewStatus",
    header: "Review Status",
    cell: ({ row }) => <ReviewStatusBadge reviewStatus={row.original.reviewStatus} />,
  },
  {
    accessorKey: "lotLabel",
    header: "Lot",
    cell: ({ row }) => <span className="text-sm">{row.original.lotLabel}</span>,
  },
  {
    accessorKey: "startingBid",
    header: () => <div className="w-28">Starting Bid</div>,
    cell: ({ row }) => <div className="w-28 tabular-nums">{row.original.startingBid}</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="w-44">Date Created</div>,
    cell: ({ row }) => <div className="w-44 text-muted-foreground">{formatDateTime(row.original.createdAt)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="flex w-28 justify-end">Actions</div>,
    cell: ({ row }) => {
      const canSubmit = row.original.reviewStatus === "draft";
      const canDelete = row.original.reviewStatus === "draft";
      const isSubmitting = submittingLotId === row.original.id;

      return (
      <div className="flex w-28 max-w-28 shrink-0 items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                aria-label={canSubmit ? "Submit for review" : "Only draft lots can be submitted"}
                size="icon-sm"
                variant="ghost"
                className={cn(
                  canSubmit ? "hover:cursor-pointer" : "cursor-not-allowed text-muted-foreground opacity-50",
                )}
                disabled={!canSubmit || isSubmitting}
                onClick={() => {
                  if (canSubmit) onSubmitForReview(row.original.id);
                }}
              >
                <Gavel />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canSubmit ? "Submit for review" : "Only draft lots can be submitted"}
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Open item actions" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Item Actions</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEditListing(row.original)}>
                Edit listing
              </DropdownMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full">
                    <DropdownMenuItem
                      disabled={!canDelete}
                      variant={canDelete ? "destructive" : undefined}
                      className={cn(!canDelete && "cursor-not-allowed opacity-50")}
                      onClick={() => {
                        if (canDelete) onDeleteLot(row.original);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                {!canDelete ? (
                  <TooltipContent>Only draft lots can be deleted</TooltipContent>
                ) : null}
              </Tooltip>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  ];
}
