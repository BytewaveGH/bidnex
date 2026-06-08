import type React from "react";

import type { LotFilter } from "./schema";

export function formatOrderCount(filter: LotFilter | undefined, count: number) {
  const label = count === 1 ? "lot" : "lots";

  if (!filter || filter === "all") return `${count.toLocaleString()} ${label}`;

  return `${count.toLocaleString()} ${filter} ${label}`;
}

export function formatSelectedOrderCount(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "lot" : "lots"} selected`;
}

export function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}
