import type { LotCondition } from "../_components/lot-form-schema";
import type { LotRow } from "../_components/recent-orders-table/schema";

export type CreateVendorLotPayload = {
  title: string;
  description: string;
  condition: string;
  startingBid: number;
  bidIncrement: number;
  reservePrice: number;
  buyNowPrice: number;
  categoryId: number;
  sku: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
};

export type CreateVendorLotApiResponse = {
  data?: VendorLot | { id?: number | string };
  status?: boolean;
  message?: string;
  error?: string;
};

export function getCreatedLotId(response: CreateVendorLotApiResponse): string | null {
  const data = response.data;
  if (!data || typeof data !== "object" || !("id" in data) || data.id == null) return null;
  return String(data.id);
}

export type VendorLotReviewStatus = "draft" | "submitted" | "approved" | "rejected";

export type VendorLotCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type VendorLotImage = {
  id: number;
  url: string;
  mediaType: "image" | "video";
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
};

export type VendorLotsQueryParams = {
  reviewStatus?: VendorLotReviewStatus;
  condition?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type VendorLot = {
  id: number;
  vendorId: number;
  title: string;
  description: string;
  condition: string;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidCount: number;
  reservePrice: number;
  buyNowPrice: number;
  status: LotRow["status"];
  reviewStatus: VendorLotReviewStatus;
  reviewRejectReason?: string;
  lotOrder: number;
  sku: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  category?: VendorLotCategory | null;
  primaryImage?: string | null;
  images?: VendorLotImage[];
  createdAt: string;
};

export type VendorLotsPage = {
  count: number;
  page: number;
  limit: number;
  data: VendorLot[];
};

export type VendorLotsApiResponse = {
  data: VendorLotsPage;
  status: boolean;
};

function formatCondition(condition: string) {
  return condition
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function resolveLotMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${path.replace(/^\//, "")}`;
}

function getPrimaryImage(lot: VendorLot): { url: string | null; mediaType: VendorLotImage["mediaType"] | null } {
  const primaryFromImages = lot.images?.find((image) => image.isPrimary) ?? lot.images?.[0];

  if (lot.primaryImage) {
    return {
      url: resolveLotMediaUrl(lot.primaryImage),
      mediaType: primaryFromImages?.mediaType ?? (lot.primaryImage.endsWith(".mp4") ? "video" : "image"),
    };
  }

  if (primaryFromImages) {
    return {
      url: resolveLotMediaUrl(primaryFromImages.url),
      mediaType: primaryFromImages.mediaType,
    };
  }

  return { url: null, mediaType: null };
}

export function mapVendorLotToLotRow(lot: VendorLot): LotRow {
  const conditionRaw = lot.condition as LotCondition;
  const primaryImage = getPrimaryImage(lot);

  return {
    id: String(lot.id),
    title: lot.title,
    description: lot.description,
    category: lot.category?.name ?? "—",
    categoryId: lot.category?.id,
    categorySlug: lot.category?.slug,
    condition: formatCondition(lot.condition),
    conditionRaw,
    status: lot.status,
    reviewStatus: lot.reviewStatus,
    reviewRejectReason: lot.reviewRejectReason ?? "",
    lotLabel: lot.sku || `Lot ${lot.lotOrder}`,
    sku: lot.sku,
    startingBid: `GHS ${lot.startingBid.toFixed(2)}`,
    startingBidAmount: lot.startingBid,
    currentBid: `GHS ${lot.currentBid.toFixed(2)}`,
    currentBidAmount: lot.currentBid,
    bidCount: lot.bidCount,
    bidIncrement: `GHS ${lot.bidIncrement.toFixed(2)}`,
    bidIncrementAmount: lot.bidIncrement,
    reservePrice: `GHS ${lot.reservePrice.toFixed(2)}`,
    reservePriceAmount: lot.reservePrice,
    buyNowPrice: `GHS ${lot.buyNowPrice.toFixed(2)}`,
    buyNowPriceAmount: lot.buyNowPrice,
    pickupAvailable: lot.pickupAvailable,
    shippingAvailable: lot.shippingAvailable,
    primaryImageUrl: primaryImage.url,
    primaryMediaType: primaryImage.mediaType ?? undefined,
    images: (lot.images ?? []).map((img) => ({
      id: img.id,
      url: resolveLotMediaUrl(img.url) ?? img.url,
      mediaType: img.mediaType,
    })),
    createdAt: lot.createdAt,
  };
}

export function buildVendorLotsParams(params: VendorLotsQueryParams) {
  const query: Record<string, string | number> = {};

  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.reviewStatus) query.reviewStatus = params.reviewStatus;
  if (params.condition) query.condition = params.condition;
  if (params.search) query.search = params.search;

  return query;
}
