"use client";
"use no memo";

import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnPinningState,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUpRight, Download, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { showToast } from "@/components/templates/toast-template";

import { mapVendorLotToLotRow } from "../_logics/vendor-lots";
import { useDeleteVendorLot } from "../_logics/useDeleteVendorLot";
import { useSubmitVendorLot } from "../_logics/useSubmitVendorLot";
import { useVendorLots } from "../_logics/useVendorLots";
import { getRecentOrdersColumns } from "./recent-orders-table/columns";
import { EditListingSheet } from "./edit-listing-sheet";
import {
  formatOrderCount,
  formatSelectedOrderCount,
  preventPaginationNavigation,
} from "./recent-orders-table/formatters";
import { type LotFilter, type LotRow, lotFilters } from "./recent-orders-table/schema";

export function RecentOrders({ refreshToken = 0 }: { refreshToken?: number }) {
  const [columnPinning] = React.useState<ColumnPinningState>({ left: ["select", "title"], right: ["actions"] });
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = React.useState<LotFilter>("all");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [submitConfirmOpen, setSubmitConfirmOpen] = React.useState(false);
  const [lotToSubmitId, setLotToSubmitId] = React.useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [localRefreshToken, setLocalRefreshToken] = React.useState(0);
  const [editListingOpen, setEditListingOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [lotToDelete, setLotToDelete] = React.useState<LotRow | null>(null);
  const [selectedLot, setSelectedLot] = React.useState<LotRow | null>(null);
  const { submitLotForReview, submittingLotId } = useSubmitVendorLot();
  const { deleteLot, deletingLotId } = useDeleteVendorLot();

  const { data, isLoading, error } = useVendorLots(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      reviewStatus: reviewStatusFilter === "all" ? undefined : reviewStatusFilter,
    },
    refreshToken + localRefreshToken,
  );

  const handleRequestSubmit = React.useCallback((lotId: string) => {
    setLotToSubmitId(lotId);
    setSubmitConfirmOpen(true);
  }, []);

  const handleConfirmSubmit = React.useCallback(async () => {
    if (!lotToSubmitId) return;
    try {
      await submitLotForReview(lotToSubmitId);
      setSubmitConfirmOpen(false);
      setLotToSubmitId(null);
      setSuccessDialogOpen(true);
      setLocalRefreshToken((token) => token + 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to submit lot for review.";
      showToast("failure", message);
    }
  }, [submitLotForReview, lotToSubmitId]);

  const handleEditListing = React.useCallback((lot: LotRow) => {
    setSelectedLot(lot);
    setEditListingOpen(true);
  }, []);

  const handleDeleteLot = React.useCallback((lot: LotRow) => {
    if (lot.reviewStatus !== "draft") return;
    setLotToDelete(lot);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!lotToDelete) return;

    try {
      await deleteLot(lotToDelete.id);
      showToast("success", "Lot deleted successfully.");
      setDeleteDialogOpen(false);
      setLotToDelete(null);
      setLocalRefreshToken((token) => token + 1);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Failed to delete lot.";
      showToast("failure", message);
    }
  }, [deleteLot, lotToDelete]);

  const columns = React.useMemo(
    () =>
      getRecentOrdersColumns({
        onSubmitForReview: handleRequestSubmit,
        onEditListing: handleEditListing,
        onDeleteLot: handleDeleteLot,
        submittingLotId,
      }),
    [handleRequestSubmit, handleEditListing, handleDeleteLot, submittingLotId],
  );

  const recentOrders = React.useMemo<LotRow[]>(
    () => (data?.data ?? []).map(mapVendorLotToLotRow),
    [data?.data],
  );

  const pageCount = data ? Math.ceil(data.count / pagination.pageSize) : 0;

  const table = useReactTable({
    data: recentOrders,
    columns,
    state: {
      columnPinning,
      rowSelection,
      sorting,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  const orderCount = data?.count ?? recentOrders.length;
  const selectedOrderCount = table.getSelectedRowModel().rows.length;
  const visibleOrderCount = table.getRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const orderCountDescription =
    selectedOrderCount > 0
      ? formatSelectedOrderCount(selectedOrderCount)
      : formatOrderCount(reviewStatusFilter, orderCount);
  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, pageCount]);

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">All Lots/Products</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {orderCountDescription}
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Button aria-label="Open orders" size="icon-sm" variant="outline">
            <ArrowUpRight />
          </Button>
          <Button aria-label="Download orders" size="icon-sm" variant="outline">
            <Download />
          </Button>
          <Button size="icon-sm" variant="outline">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex items-center justify-between px-4">
          <ToggleGroup
            className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
            onValueChange={(value) => {
              if (!value) return;
              setReviewStatusFilter(value as LotFilter);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            size="sm"
            spacing={1}
            type="single"
            value={reviewStatusFilter}
          >
            {lotFilters.map((filter) => (
              <ToggleGroupItem key={filter} value={filter}>
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => table.getColumn("createdAt")?.toggleSorting(table.getColumn("createdAt")?.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={
                        header.column.getIsPinned() === "left"
                          ? { position: "sticky", left: header.column.getStart("left"), zIndex: 1 }
                          : header.column.getIsPinned() === "right"
                          ? { position: "sticky", right: header.column.getAfter("right"), zIndex: 1 }
                          : undefined
                      }
                      className={header.column.getIsPinned() ? "bg-background" : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:px-4 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-muted/40">
              {isLoading ? (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={table.getVisibleLeafColumns().length}>
                    Loading lots...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell className="h-24 text-center text-destructive" colSpan={table.getVisibleLeafColumns().length}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() => handleEditListing(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={
                          cell.column.getIsPinned() === "left"
                            ? { position: "sticky", left: cell.column.getStart("left"), zIndex: 1 }
                            : cell.column.getIsPinned() === "right"
                            ? { position: "sticky", right: cell.column.getAfter("right"), zIndex: 1 }
                            : undefined
                        }
                        className={cell.column.getIsPinned() ? "bg-background" : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={table.getVisibleLeafColumns().length}>
                    No lots found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {visibleOrderCount} out of {orderCount.toLocaleString()} lots
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => {
                    preventPaginationNavigation(event);
                    table.previousPage();
                  }}
                />
              </PaginationItem>
              {pageNumbers[0] > 1 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              {pageNumbers.map((pageNumber) => (
                <PaginationItem key={`page-${pageNumber}`}>
                  <PaginationLink
                    href="#"
                    isActive={table.getState().pagination.pageIndex === pageNumber - 1}
                    onClick={(event) => {
                      preventPaginationNavigation(event);
                      table.setPageIndex(pageNumber - 1);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pageNumbers[pageNumbers.length - 1] < pageCount ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationNext
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => {
                    preventPaginationNavigation(event);
                    table.nextPage();
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Your lot has been submitted for review successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditListingSheet
        lot={selectedLot}
        open={editListingOpen}
        onOpenChange={setEditListingOpen}
        onSuccess={() => setLocalRefreshToken((token) => token + 1)}
      />

      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit lot for review?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, you won&apos;t be able to edit this lot until it has been reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!submittingLotId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!submittingLotId}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmSubmit();
              }}
            >
              {submittingLotId ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{lotToDelete?.title}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingLotId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!!deletingLotId}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {deletingLotId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
