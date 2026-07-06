"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Info, MapPinned, Package2, ShoppingBag, Store, Truck } from "lucide-react";

import { showToast } from "@/components/templates/toast-template";
import { useAxios } from "@/hooks/use-axios";
import { useCheckoutItems, type CheckoutItem } from "../../_logics/useCheckoutItems";
import { useGeneratePaymentLink } from "../../_logics/useGeneratePaymentLink";
import { saveDeliveryRecord } from "@/lib/delivery-store";
import { buildYangoDeepLink, geocodeAddress, type Coordinates } from "@/lib/yango";
import type { PublicLotApiResponse } from "@/app/(bidder)/bidder/(product)/_logics/usePublicLot";
import type { PickedLocation } from "./_components/location-picker";

// Leaflet touches `window` at module-load time, which breaks Next's SSR pass
// for this client component — load it only once we're actually in the browser.
const LocationPicker = dynamic(() => import("./_components/location-picker"), {
  ssr: false,
  loading: () => <div className="h-[228px] rounded-[14px] bg-[#F0F2F5] animate-pulse" />,
});

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`size-5 shrink-0 rounded-[5px] border-2 flex items-center justify-center transition-colors ${
        checked || indeterminate
          ? "bg-[#344054] border-[#344054]"
          : "bg-white border-[#D0D5DD]"
      }`}
    >
      {indeterminate && !checked ? (
        <span className="block w-2.5 h-0.5 bg-white rounded-full" />
      ) : checked ? (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

function OrderItem({
  item,
  isSelected,
  onToggle,
}: {
  item: CheckoutItem;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 py-4 border-b border-[#F0F2F5] last:border-0 cursor-pointer"
      onClick={onToggle}
    >
      <Checkbox checked={isSelected} onChange={onToggle} />

      <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F0F2F5]">
        <Package2 className="size-5 text-[#657688]" />
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-0.5">
        <p className="text-sm font-medium text-[#2A3239] line-clamp-2 leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-[#657688]">
          Platform fee: {formatGHS(item.fee)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-bold text-sm text-[#2A3239]">{formatGHS(item.amount)}</p>
        <p className="text-xs text-[#657688]">Winning bid</p>
      </div>
    </div>
  );
}

function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#F0F2F5]">
      <div className="size-5 rounded-[5px] bg-[#F0F2F5] animate-pulse shrink-0" />
      <div className="size-10 rounded-[8px] bg-[#F0F2F5] animate-pulse shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 bg-[#F0F2F5] animate-pulse rounded w-3/4" />
        <div className="h-3 bg-[#F0F2F5] animate-pulse rounded w-1/3" />
      </div>
      <div className="flex flex-col gap-1 items-end">
        <div className="h-4 bg-[#F0F2F5] animate-pulse rounded w-20" />
        <div className="h-3 bg-[#F0F2F5] animate-pulse rounded w-16" />
      </div>
    </div>
  );
}

type Fulfillment = "pickup" | "delivery";

export default function Checkout() {
  const { data, isLoading, error } = useCheckoutItems();
  const { generatePaymentLink, isLoading: isGenerating } = useGeneratePaymentLink();
  const callApi = useAxios();
  const [isPaying, setIsPaying] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [deliveryLocation, setDeliveryLocation] = useState<PickedLocation | null>(null);
  const [fulfillmentError, setFulfillmentError] = useState<string | null>(null);

  const items: CheckoutItem[] = data?.items ?? [];

  useEffect(() => {
    if (items.length > 0) {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [data]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  const { subtotal, platformFee } = useMemo(() => ({
    subtotal: selectedItems.reduce((sum, i) => sum + i.amount, 0),
    platformFee: selectedItems.reduce((sum, i) => sum + i.fee, 0),
  }), [selectedIds, data]);

  const total = subtotal + platformFee;

  async function registerDelivery(item: CheckoutItem, location: PickedLocation) {
    let vendorCoords: Coordinates | undefined;
    let vendorAddressLabel: string | undefined;
    try {
      const response = (await callApi({ method: "GET", url: `/public/lots/${item.id}` })) as {
        status: number;
        data: PublicLotApiResponse;
      };
      const auction = response.status < 400 ? response.data?.data?.auction : undefined;
      const addressText = [auction?.locationName, auction?.locationAddress].filter(Boolean).join(", ");
      if (addressText) {
        vendorAddressLabel = addressText;
        const geocoded = await geocodeAddress(addressText);
        vendorCoords = geocoded?.coords;
      }
    } catch {
      // Best-effort — the vendor can still confirm price and dispatch without a resolved pickup pin.
    }

    saveDeliveryRecord({
      lotId: item.id,
      lotTitle: item.title,
      method: "delivery",
      vendorAddressLabel,
      vendorCoords,
      customerCoords: location.coords,
      customerAddressLabel: location.label,
      status: "requested",
      dispatchLink: vendorCoords ? buildYangoDeepLink(vendorCoords, location.coords) : undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  async function handleConfirmAndPay() {
    if (selectedItems.length === 0) return;
    if (fulfillment === "delivery" && !deliveryLocation) {
      setFulfillmentError("Please choose a delivery location on the map to continue.");
      return;
    }
    setFulfillmentError(null);
    setIsPaying(true);
    try {
      if (fulfillment === "delivery" && deliveryLocation) {
        await Promise.all(selectedItems.map((item) => registerDelivery(item, deliveryLocation)));
      }
      const result = await generatePaymentLink(selectedItems.map((i) => i.id));
      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        showToast("failure", "No payment link returned. Please try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate payment link.";
      showToast("failure", message);
    } finally {
      setIsPaying(false);
    }
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-[#D42620] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-8 items-start">
      {/* ── Left column ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#657688]">
            Items Pending Payment
          </h2>
          {!isLoading && items.length > 0 && (
            <span className="text-xs text-[#657688]">
              {selectedIds.size} of {items.length} selected
            </span>
          )}
        </div>

        <div className="border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
          {isLoading ? (
            <div className="px-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderItemSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#F0F2F5]">
                <ShoppingBag className="size-6 text-[#657688]" />
              </div>
              <p className="text-[#657688] text-sm text-center">
                You have no items pending payment.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F0F2F5]">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
                <span className="text-xs font-medium text-[#344054]">
                  {allSelected ? "Deselect all" : "Select all"}
                </span>
              </div>
              <div className="px-5">
                {items.map((item) => (
                  <OrderItem
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.has(item.id)}
                    onToggle={() => toggleOne(item.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right column ── */}
      <div className="w-full xl:w-[340px] shrink-0 xl:sticky xl:top-[90px] flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#657688] mb-4">
            Fulfillment
          </h2>

          <div className="border border-[#F0F2F5] rounded-[16px] bg-white p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setFulfillment("pickup"); setFulfillmentError(null); }}
                className={`h-10 rounded-[10px] border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  fulfillment === "pickup"
                    ? "bg-[#344054] border-[#344054] text-white"
                    : "bg-white border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
                }`}
              >
                <Store className="size-4" /> Pickup
              </button>
              <button
                type="button"
                onClick={() => setFulfillment("delivery")}
                className={`h-10 rounded-[10px] border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  fulfillment === "delivery"
                    ? "bg-[#344054] border-[#344054] text-white"
                    : "bg-white border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
                }`}
              >
                <Truck className="size-4" /> Delivery
              </button>
            </div>

            {fulfillment === "pickup" && (
              <p className="text-xs text-[#657688]">
                You&apos;ll pick up your items after payment — we&apos;ll share pickup details for each vendor.
              </p>
            )}

            {fulfillment === "delivery" && (
              <>
                <div className="rounded-[10px] bg-[#F9FAFB] p-3 flex gap-2 text-xs text-[#657688]">
                  <MapPinned className="size-4 shrink-0 text-[#657688]" />
                  <p>
                    Drop a pin for your delivery address. The vendor will personally arrange a Yango courier and
                    reach out to confirm the exact delivery cost before dispatching — it&apos;s not an instant fixed price.
                  </p>
                </div>
                <LocationPicker
                  value={deliveryLocation}
                  onChange={(location) => { setDeliveryLocation(location); setFulfillmentError(null); }}
                />
              </>
            )}

            {fulfillmentError && <p className="text-xs text-[#D42620]">{fulfillmentError}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#657688] mb-4">
            Order Summary
          </h2>

          <div className="border border-[#F0F2F5] rounded-[16px] bg-white overflow-hidden">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#344054]">Subtotal</span>
                {isLoading ? (
                  <div className="h-4 w-24 bg-[#F0F2F5] animate-pulse rounded" />
                ) : (
                  <span className="text-sm font-semibold text-[#2A3239]">{formatGHS(subtotal)}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#344054]">Platform Fee</span>
                  <div className="relative group">
                    <Info className="size-3.5 text-[#657688] cursor-default" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 bg-[#344054] text-white text-xs rounded-lg px-3 py-2 text-center shadow-lg z-10">
                      Platform service fee of 2%, capped at GHS 3.00 per item.
                    </div>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-4 w-20 bg-[#F0F2F5] animate-pulse rounded" />
                ) : (
                  <span className="text-sm font-semibold text-[#2A3239]">{formatGHS(platformFee)}</span>
                )}
              </div>

              <div className="border-t border-[#F0F2F5] pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-[#2A3239]">Total Due</span>
                {isLoading ? (
                  <div className="h-5 w-28 bg-[#F0F2F5] animate-pulse rounded" />
                ) : (
                  <span className="text-base font-bold text-[#2A3239]">{formatGHS(total)}</span>
                )}
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={handleConfirmAndPay}
                disabled={isLoading || isPaying || isGenerating || selectedIds.size === 0}
                className="w-full h-12 bg-[#344054] hover:bg-[#1D2939] text-white font-semibold text-sm rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaying || isGenerating
                  ? "Generating payment link…"
                  : selectedIds.size > 0
                    ? `Pay for ${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""}`
                    : "Select items to pay"}
              </button>
            </div>

            <div className="border-t border-[#F0F2F5] px-5 py-4">
              <p className="text-[10px] text-[#657688] text-center leading-relaxed uppercase tracking-wide">
                We offer a 7-day full refund guarantee, starting from the date the item is picked up, if an issue is discovered that was not described or pictured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
