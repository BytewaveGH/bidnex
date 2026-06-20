"use client";
"use no memo";

import * as React from "react";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

import { transactionColumns } from "./transactions-table/columns";
import transactionsData from "./transactions-table/data.json";
import { type TransactionRow, type TxnFilter, txnFilters } from "./transactions-table/schema";
import { FINANCE_TRANSACTIONS_TABLE_ID, subscribeToTransactionsFilter } from "../_logics/finance-transactions-bridge";

const transactions = transactionsData as TransactionRow[];

function preventNav(event: React.MouseEvent) {
  event.preventDefault();
}

export function TransactionsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: transactions,
    columns: transactionColumns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilter = (table.getColumn("type")?.getFilterValue() as TxnFilter | undefined) ?? "All";
  const total = table.getFilteredRowModel().rows.length;
  const visible = table.getRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];
    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, pageCount]);

  React.useEffect(() => {
    return subscribeToTransactionsFilter((filter) => {
      table.getColumn("type")?.setFilterValue(filter === "All" ? undefined : filter);
      table.setPageIndex(0);
    });
  }, [table]);

  return (
    <Card id={FINANCE_TRANSACTIONS_TABLE_ID}>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Transactions</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {total.toLocaleString()} records
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Button aria-label="Download transactions" size="icon-sm" variant="outline">
            <Download />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex items-center justify-between px-4">
          <ToggleGroup
            className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
            onValueChange={(value) => {
              if (!value) return;
              table.getColumn("type")?.setFilterValue(value === "All" ? undefined : value);
              table.setPageIndex(0);
            }}
            size="sm"
            spacing={1}
            type="single"
            value={activeFilter}
          >
            {txnFilters.map((filter) => (
              <ToggleGroupItem key={filter} value={filter}>
                {filter}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => table.getColumn("date")?.toggleSorting(table.getColumn("date")?.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>

        <div className="overflow-hidden">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:px-4 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={transactionColumns.length}>
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            Viewing {visible} of {total.toLocaleString()} transactions
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => { preventNav(event); table.previousPage(); }}
                />
              </PaginationItem>
              {pageNumbers[0] > 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              {pageNumbers.map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={table.getState().pagination.pageIndex === n - 1}
                    onClick={(event) => { preventNav(event); table.setPageIndex(n - 1); }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pageNumbers[pageNumbers.length - 1] < pageCount && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationNext
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => { preventNav(event); table.nextPage(); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
