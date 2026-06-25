"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const roleRedirects: Record<string, string> = {
  vendor: "/vendor/dashboard/home",
  bidder: "/bidder/all-items",
  admin: "/admin/programs",
  manager: "/manager/programs",
  eso: "/eso/programs",
  participant: "/coach/onboarding",
};

export default function SocialCallbackPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
      return;
    }
    const userType = session?.user?.userType as string | undefined;
    const destination = userType ? (roleRedirects[userType] ?? "/") : "/";
    window.location.href = destination;
  }, [session, status]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#13161A] border-t-transparent mx-auto mb-4" />
        <p className="text-sm text-[#657688]">Signing you in…</p>
      </div>
    </main>
  );
}
