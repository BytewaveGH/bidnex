"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { showToast } from "@/components/templates/toast-template";

const roleRedirects: Record<"vendor" | "bidder", string> = {
  vendor: "/vendor/dashboard/home",
  bidder: "/bidder/all-items",
};

export function useSwitchAccount(targetRole: "vendor" | "bidder") {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function switchAccount(username: string) {
    if (!password.trim()) {
      showToast("failure", "Password is required");
      return false;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        username,
        password,
        loginAs: targetRole,
        rememberMe: "true",
        redirect: false,
      });

      if (!result || result.error) {
        showToast("failure", result?.code || `Couldn't switch to ${targetRole}`);
        return false;
      }

      const session = await getSession();
      const userType = session?.user?.userType as string | undefined;

      if (!session?.user?.isVerified) {
        const phone = session?.user?.phone ?? "";
        window.location.href = `/auth/verify?phone=${encodeURIComponent(phone)}&accountType=${targetRole}`;
        return true;
      }

      showToast("success", `Switched to ${targetRole}`);
      window.location.href = roleRedirects[(userType as "vendor" | "bidder") ?? targetRole];
      return true;
    } finally {
      setIsLoading(false);
    }
  }

  return { password, setPassword, isLoading, switchAccount };
}
