import { z } from "zod";

export const txnTypes = ["Auction Sale", "Buy Now Sale", "Platform Fee", "Payout", "Dispute Hold", "Dispute Release", "Refund"] as const;
export const txnStatuses = ["Completed", "Pending", "Processing", "Failed"] as const;

export const txnFilters = ["All", "Pending"] as const;
export type TxnFilter = (typeof txnFilters)[number];

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  lotId: z.string().nullable(),
  description: z.string(),
  type: z.enum(txnTypes),
  amount: z.number(),
  status: z.enum(txnStatuses),
});

export type TransactionRow = z.infer<typeof transactionSchema>;
