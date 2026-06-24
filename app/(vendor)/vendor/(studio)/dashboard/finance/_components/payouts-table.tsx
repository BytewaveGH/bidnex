"use client";

import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { usePayouts, type PayoutRow } from "../_logics/usePayouts";

const PAGE_SIZE = 10;

const EMPTY: PayoutRow[] = [];

function preventNav(event: React.MouseEvent) {
  event.preventDefault();
}

const columns: ColumnDef<PayoutRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm w-40">
        {format(parseISO(row.original.createdAt), "d MMM yyyy, h:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "lotTitle",
    header: "Lot",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 max-w-72">
        <span className="text-sm leading-none truncate">{row.original.lotTitle}</span>
        <span className="text-muted-foreground text-xs">{row.original.lotId}</span>
      </div>
    ),
  },
  {
    accessorKey: "transferAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <div className="tabular-nums text-sm font-medium text-green-700 dark:text-green-400">
          GHS {row.original.transferAmount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
        </div>
      </div>
    ),
  },
];

export function PayoutsTable() {
  const [page, setPage] = React.useState(1);
  const { data, count, isLoading, error } = usePayouts({ page, limit: PAGE_SIZE });

  const tableData = React.useMemo(() => data ?? EMPTY, [data]);
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (page <= 2) return [1, 2, 3];
    if (page >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];
    return [page - 1, page, page + 1];
  }, [page, pageCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Payout Transactions</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {count.toLocaleString()} records
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="min-w-0 overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: columns.length }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                    Failed to load payout transactions. Please refresh.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                    No payout transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Page {page} of {pageCount} &middot; {count.toLocaleString()} total
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                  onClick={(event) => { preventNav(event); setPage((p) => Math.max(1, p - 1)); }}
                />
              </PaginationItem>
              {pageNumbers[0] > 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              {pageNumbers.map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={page === n}
                    onClick={(event) => { preventNav(event); setPage(n); }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pageNumbers[pageNumbers.length - 1] < pageCount && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
                  onClick={(event) => { preventNav(event); setPage((p) => Math.min(pageCount, p + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
