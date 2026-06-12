export type AuctionStatus = "draft" | "active" | "ended" | "cancelled";
export type LotStatus = "pending" | "active" | "ended" | "cancelled";
export type LotReviewStatus = "draft" | "submitted" | "approved" | "rejected";

export type AuctionLotCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type AuctionLotImage = {
  id: number;
  url: string;
  mediaType: "image" | "video";
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
};

export type AuctionLot = {
  id: number;
  vendorId: number;
  auctionId?: number | null;
  title: string;
  description: string;
  condition: string;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidCount: number;
  winnerId?: number | null;
  bidderIds: number[];
  reservePrice: number;
  buyNowPrice: number;
  status: LotStatus;
  reviewStatus: LotReviewStatus;
  reviewRejectReason: string;
  lotOrder: number;
  bidStartTime: string;
  bidEndTime: string;
  sku: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  category?: AuctionLotCategory | null;
  primaryImage: string;
  images: AuctionLotImage[];
  createdAt: string;
};

export type Auction = {
  id: number;
  title: string;
  description: string;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  vendorId: number;
  isFeatured: boolean;
  locationName: string;
  locationAddress: string;
  lotCount: number;
  lotInterval: number;
  createdAt: string;
  lots: AuctionLot[];
};

export type AuctionsPage = {
  count: number;
  page: number;
  limit: number;
  data: Auction[];
};

export type AuctionsApiResponse = {
  data: AuctionsPage;
  status: boolean;
};

export type AuctionsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AuctionStatus;
};

export function buildAuctionsParams(params: AuctionsQueryParams) {
  const query: Record<string, string | number> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.search) query.search = params.search;
  if (params.status) query.status = params.status;
  return query;
}

export type LotsOrderBy = "ending_soon" | "ending_last";

export type LotsQueryParams = {
  categoryId?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  auctionId?: number;
  page?: number;
  limit?: number;
  orderBy?: LotsOrderBy;
};

export type LotsPage = {
  count: number;
  page: number;
  limit: number;
  data: AuctionLot[];
};

export type LotsApiResponse = {
  data: LotsPage;
  status: boolean;
};

export function buildLotsParams(params: LotsQueryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.search) query.search = params.search;
  if (params.categoryId !== undefined) query.categoryId = params.categoryId;
  if (params.condition) query.condition = params.condition;
  if (params.minPrice !== undefined) query.minPrice = params.minPrice;
  if (params.maxPrice !== undefined) query.maxPrice = params.maxPrice;
  if (params.auctionId !== undefined) query.auctionId = params.auctionId;
  if (params.orderBy) query.orderBy = params.orderBy;
  return query;
}

export function resolveLotMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${path.replace(/^\//, "")}`;
}

export function formatLotCondition(condition: string): string {
  return condition
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function computeTimeRemaining(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ENDED";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days} DAYS ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function mapLotToProductCard(lot: AuctionLot) {
  return {
    id: lot.id,
    image: resolveLotMediaUrl(lot.primaryImage) ?? "",
    condition: formatLotCondition(lot.condition),
    quantity: 1,
    timeRemaining: computeTimeRemaining(lot.bidEndTime),
    bidEndTime: lot.bidEndTime,
    bidders: lot.bidCount,
    productName: lot.title,
    marketPrice: `GHS ${lot.buyNowPrice.toFixed(2)}`,
    currentBid: lot.currentBid,
    increment: lot.bidIncrement,
  };
}
