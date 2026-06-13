"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./product-card";
import { usePublicLots } from "@/app/(bidder)/bidder/(all-items)/_logics/usePublicLots";
import { mapLotToProductCard } from "@/app/(bidder)/bidder/(all-items)/_logics/auctions";
import { useWatchlistIds } from "@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds";
import { useSession } from "next-auth/react";

export default function LiveAuctions() {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { watchlistIds, pendingIds, toggleWatchlist } = useWatchlistIds();

  const { data, isLoading } = usePublicLots({ orderBy: "ending_soon", limit: 5 });

  const items = useMemo(() => {
    if (!data) return [];
    return data.data.map(mapLotToProductCard);
  }, [data]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex w-full items-end justify-between mb-8">
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-3xl font-bold mb-1.5">
            Live Auctions
            <br />
            Ending Soon
          </h2>
          <div className="text-base font-normal text-[#657688]">
            Don&apos;t miss out on
            <br />
            these hot deals
          </div>
        </div>
        <span
          className="text-sm font-normal underline cursor-pointer"
          onClick={() => router.push("/bidder/all-items")}
        >
          See All
        </span>
      </div>

      {isLoading ? (
        <div className="flex gap-7 w-full overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[340px] h-[480px] shrink-0 rounded-[16px] bg-[#F0F2F5] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="w-full flex justify-center items-center py-10">
          <p className="text-[#657688] text-sm">No live auctions right now.</p>
        </div>
      ) : (
        <div className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <div key={item.id} className="w-[340px] shrink-0">
              <ProductCard
                product={item}
                isLoggedIn={isLoggedIn}
                isInWatchlist={watchlistIds.has(item.id)}
                onWatchlistToggle={() => toggleWatchlist(item.id)}
                isWatchlistLoading={pendingIds.has(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
