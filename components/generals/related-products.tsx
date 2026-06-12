"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import ButtonTemplate from "../templates/button-template";
import { LotCardItem } from "./lot-card-item";
import { usePublicLots } from "@/app/(bidder)/bidder/(all-items)/_logics/usePublicLots";
import { useLotRealtime } from "@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime";

const RELATED_LIMIT = 5;

type RelatedProductsProps = {
  categoryId?: number;
  excludeLotId?: number;
};

export default function RelatedProducts({ categoryId, excludeLotId }: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data, isLoading, error } = usePublicLots({
    categoryId,
    limit: RELATED_LIMIT,
  });
  const baseLots = useMemo(
    () => (data?.data ?? []).filter((lot) => lot.id !== excludeLotId),
    [data, excludeLotId],
  );
  const realtimeLots = useLotRealtime(baseLots);

  const checkScrollAvailability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollAvailability();
    setTimeout(checkScrollAvailability, 100);

    container.addEventListener("scroll", checkScrollAvailability);
    window.addEventListener("resize", checkScrollAvailability);

    return () => {
      container.removeEventListener("scroll", checkScrollAvailability);
      window.removeEventListener("resize", checkScrollAvailability);
    };
  }, [realtimeLots]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
    setTimeout(checkScrollAvailability, 500);
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" });
    setTimeout(checkScrollAvailability, 500);
  };

  if (!categoryId) return null;

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <h2 className="text-3xl font-bold w-full mb-8">Related Products</h2>
        <div className="flex gap-7 w-full overflow-hidden">
          {Array.from({ length: RELATED_LIMIT }).map((_, i) => (
            <div key={i} className="w-[340px] shrink-0 h-[480px] rounded-[16px] bg-[#F0F2F5] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || realtimeLots.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full ">
      <div className="flex w-full items-start justify-between mb-8">
        <h2 className="text-3xl font-bold">Related Products</h2>
        <div className="flex items-center justify-center gap-2">
          <ButtonTemplate
            title={
              <ArrowLeft
                className={`w-4 h-4 ${canScrollLeft ? "text-[#2A3239]" : "text-[#98A2B3]"}`}
              />
            }
            className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollLeft ? "border-[#2A3239]" : "border-[#98A2B3]"}`}
            onClick={scrollLeft}
          />
          <ButtonTemplate
            title={
              <ArrowRight
                className={`w-4 h-4 ${canScrollRight ? "text-[#2A3239]" : "text-[#98A2B3]"}`}
              />
            }
            className={`bg-white text-black hover:bg-white h-10 w-10 border rounded-full p-0 cursor-pointer ${canScrollRight ? "border-[#2A3239]" : "border-[#98A2B3]"}`}
            onClick={scrollRight}
          />
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {realtimeLots.map((lot) => (
          <div key={lot.id} className="w-[340px] shrink-0">
            <LotCardItem lot={lot} />
          </div>
        ))}
      </div>
    </div>
  );
}
