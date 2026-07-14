"use client";

import { formatDisputeStatus, type Dispute, type DisputeMessage } from "../../_logics/disputes";

export function disputeStatusBadge(status: string) {
  switch (status) {
    case "open":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "under_review":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "resolved_refund":
      return "bg-green-50 text-green-700 border-green-200";
    case "resolved_no_action":
      return "bg-[#F0F2F5] text-[#657688] border-[#E4E7EC]";
    default:
      return "bg-[#F0F2F5] text-[#657688] border-[#E4E7EC]";
  }
}

export function isDisputeResolved(status: string) {
  return status === "resolved_no_action" || status === "resolved_refund";
}

export function isDisputeOpen(status: string) {
  return status === "open" || status === "under_review";
}

export function getSenderLabel(
  message: DisputeMessage,
  dispute: Dispute,
  currentUserId: number,
) {
  if (message.senderId === currentUserId) return "You";
  if (dispute.sellerId && message.senderId === dispute.sellerId) return "Seller";
  if (dispute.buyerId && message.senderId === dispute.buyerId) return "Buyer";
  return "Support";
}
