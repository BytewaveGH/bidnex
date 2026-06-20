export const FINANCE_TRANSACTIONS_TABLE_ID = "finance-transactions-table";

export type FinanceTransactionsFilter = "All" | "Pending";

type FilterListener = (filter: FinanceTransactionsFilter) => void;

let filterListener: FilterListener | null = null;

export function subscribeToTransactionsFilter(listener: FilterListener) {
  filterListener = listener;
  return () => {
    if (filterListener === listener) {
      filterListener = null;
    }
  };
}

export function scrollToTransactionsTable(filter: FinanceTransactionsFilter = "Pending") {
  document.getElementById(FINANCE_TRANSACTIONS_TABLE_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  filterListener?.(filter);
}
