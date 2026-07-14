"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DisputeThread from "./dispute-thread";

type DisputeDetailProps = {
  disputeId: number;
};

export default function DisputeDetail({ disputeId }: DisputeDetailProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 h-[calc(100dvh-140px)] min-h-[520px]">
      <button
        type="button"
        onClick={() => router.push("/bidder/billing?tab=disputes")}
        className="inline-flex items-center gap-1.5 text-sm text-[#657688] hover:text-[#344054] w-fit shrink-0"
      >
        <ArrowLeft className="size-4" />
        Back to disputes
      </button>

      <div className="flex-1 min-h-0 w-full overflow-hidden border border-[#F0F2F5] rounded-[16px]">
        <DisputeThread disputeId={disputeId} className="h-full" />
      </div>
    </div>
  );
}
