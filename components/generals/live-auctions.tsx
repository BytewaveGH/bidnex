"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LotCardItem } from "./lot-card-item";
import { usePublicLots } from "@/app/(bidder)/bidder/(all-items)/_logics/usePublicLots";
import { useLotRealtime } from "@/app/(bidder)/bidder/(all-items)/_logics/useLotRealtime";

export default function LiveAuctions() {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = session?.user?.userType === "bidder";
  const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set());

  const { data, isLoading } = usePublicLots({ orderBy: "ending_soon", limit: 5 });

  const baseLots = useMemo(() => data?.data ?? [], [data]);
  const realtimeLots = useLotRealtime(baseLots);
  const visibleLots = useMemo(
    () => realtimeLots.filter((l) => !expiredIds.has(l.id)),
    [realtimeLots, expiredIds],
  );

  const handleExpired = useCallback((id: number) => {
    setExpiredIds((prev) => new Set(prev).add(id));
  }, []);

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
      ) : visibleLots.length === 0 ? (
        <div className="w-full flex justify-center items-center py-10">
          <p className="text-[#657688] text-sm">No live auctions right now.</p>
        </div>
      ) : (
        <div className="flex gap-7 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
