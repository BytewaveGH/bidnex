import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";

import type { TransactionRow } from "./schema";

function TypeBadge({ type }: { type: TransactionRow["type"] }) {
  const styles: Record<TransactionRow["type"], string> = {
    "Auction Sale": "border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300",
    "Buy Now Sale": "border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300",
    "Platform Fee": "border-orange-700/25 text-orange-700 dark:border-orange-300/25 dark:text-orange-300",
    "Payout": "border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300",
    "Dispute Hold": "border-red-700/25 text-red-700 dark:border-red-300/25 dark:text-red-300",
    "Dispute Release": "border-purple-700/25 text-purple-700 dark:border-purple-300/25 dark:text-purple-300",
    "Refund": "border-red-700/25 text-red-700 dark:border-red-300/25 dark:text-red-300",
  };

  return (
    <Badge className={styles[type]} variant="outline">
      {type}
    </Badge>
  );
}

function StatusBadge({ status }: { status: TransactionRow["status"] }) {
  if (status === "Completed") {
    return (
      <Badge className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300" variant="outline">
        <span className="size-1.5 rounded-full bg-current" />
        Completed
      </Badge>
    );
  }
  if (status === "Processing") {
    return (
      <Badge className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300" variant="outline">
        <span className="size-1.5 rounded-full bg-current" />
        Processing
      </Badge>
    );
  }
  if (status === "Pending") {
    return (
      <Badge className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300" variant="outline">
        <span className="size-1.5 rounded-full bg-current" />
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <span className="size-1.5 rounded-full bg-current" />
      Failed
    </Badge>
  );
}

function AmountCell({ amount }: { amount: number }) {
  const isCredit = amount > 0;
  return (
    <div className={`tabular-nums font-medium ${isCredit ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
      {isCredit ? "+" : ""}GHS {Math.abs(amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
    </div>
  );
}

export const transactionColumns: ColumnDef<TransactionRow>[] = [
  {
    accessorKey: "id",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-medium tabular-nums text-sm">{row.original.id}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm w-40">
        {format(parseISO(row.original.date), "d MMM yyyy, h:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 max-w-80">
        <span className="text-sm leading-none">{row.original.description}</span>
        {row.original.lotId && (
          <span className="text-muted-foreground text-xs">{row.original.lotId}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <TypeBadge type={row.original.type} />,
    filterFn: (row, _columnId, value) => {
      if (value === "Credits") return row.original.amount > 0;
      if (value === "Debits") return row.original.amount < 0;
      if (value === "Pending") return row.original.status === "Pending" || row.original.status === "Processing";
      return true;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AmountCell amount={row.original.amount} />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
