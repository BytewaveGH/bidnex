"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import ButtonTemplate from "../templates/button-template";
import { LotCardItem } from "./lot-card-item";
import { usePublicAuctions } from "@/app/(bidder)/bidder/(all-items)/_logics/usePublicAuctions";
import { useLotRealtime } from "@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime";
import { useResyncOnReconnect } from "@/components/generals/providers/websocket-provider";

export default function FeaturedItems() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set());

  const { data: session } = useSession();
  const isLoggedIn = session?.user?.userType === "bidder";

  const { data, isLoading, refetch } = usePublicAuctions({ featured: true, limit: 10 });
  useResyncOnReconnect(refetch);

  const baseLots = useMemo(() => {
    if (!data) return [];
    return data.data.flatMap((auction) => auction.lots ?? []);
  }, [data]);

  const realtimeLots = useLotRealtime(baseLots);
  const visibleLots = useMemo(
    () => realtimeLots.filter((l) => !expiredIds.has(l.id)),
    [realtimeLots, expiredIds],
  );

  const handleExpired = useCallback((id: number) => {
    setExpiredIds((prev) => new Set(prev).add(id));
  }, []);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    setTimeout(checkScroll, 100);
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [visibleLots]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
    setTimeout(checkScroll, 500);
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" });
    setTimeout(checkScroll, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex w-full items-start justify-between mb-8">
        <h2 className="text-3xl font-bold">Featured Items</h2>
        <div className="flex items-center justify-center gap-2">
          <ButtonTemplate
            title={<ArrowLeft className={`w-4 h-4 ${canScrollLeft ? "text-[#2A3239]" : "text-[#98A2B3]"}`} />}
            className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollLeft ? "border-[#2A3239]" : "border-[#98A2B3]"}`}
            onClick={scrollLeft}
          />
          <ButtonTemplate
            title={<ArrowRight className={`w-4 h-4 ${canScrollRight ? "text-[#2A3239]" : "text-[#98A2B3]"}`} />}
            className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollRight ? "border-[#2A3239]" : "border-[#98A2B3]"}`}
            onClick={scrollRight}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-7 w-full overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[340px] h-[480px] shrink-0 rounded-[16px] bg-[#F0F2F5] animate-pulse" />
          ))}
        </div>
      ) : visibleLots.length === 0 ? (
        <div className="w-full flex justify-center items-center py-10">
          <p className="text-[#657688] text-sm">No featured items available.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleLots.map((lot) => (
            <div key={lot.id} className="w-[340px] shrink-0">
              <LotCardItem lot={lot} isLoggedIn={isLoggedIn} onExpired={handleExpired} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
