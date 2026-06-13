import { LotCondition } from "../lot-form-schema";


export const lotFilters = ["all", "draft", "submitted", "approved", "rejected"] as const;

export type LotFilter = (typeof lotFilters)[number];

export type LotRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId?: number;
  categorySlug?: string;
  condition: string;
  conditionRaw: LotCondition;
  status: "pending" | "active" | "sold" | "unsold" | "cancelled";
  reviewStatus: "draft" | "submitted" | "approved" | "rejected";
  reviewRejectReason: string;
  lotLabel: string;
  sku: string;
  startingBid: string;
  startingBidAmount: number;
  currentBid: string;
  currentBidAmount: number;
  bidCount: number;
  bidIncrement: string;
  bidIncrementAmount: number;
  reservePrice: string;
  reservePriceAmount: number;
  buyNowPrice: string;
  buyNowPriceAmount: number;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  primaryImageUrl: string | null;
  primaryMediaType?: "image" | "video";
  images: Array<{ id: number; url: string; mediaType: "image" | "video" }>;
  specifications?: Record<string, unknown> | null;
  createdAt: string;
};
