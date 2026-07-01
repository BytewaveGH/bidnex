"use client";

import { useState } from "react";
import { showToast } from "@/components/templates/toast-template";
import { signIn, getSession } from "next-auth/react";

const roleRedirects: Record<string, string> = {
  vendor: "/vendor/dashboard/home",
  bidder: "/bidder/all-items",
  admin: "/admin/programs",
  manager: "/manager/programs",
  eso: "/eso/programs",
  participant: "/coach/onboarding",
};
export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginAs, setLoginAs] = useState<"bidder" | "vendor">("bidder");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      showToast("failure", "Username is required");
      return;
    }

    if (!password.trim()) {
      showToast("failure", "Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        loginAs,
        redirect: false,
      });

      console.log("SIGNIN RESULT:", result);

      if (!result || result.error) {
        showToast("failure", result?.error || "Login failed");
        return;
      }

      const session = await getSession();
      const userType = session?.user?.userType as string | undefined;

      if (!session?.user?.isVerified) {
        const phone = session?.user?.phone ?? "";
        window.location.href = `/auth/verify?phone=${encodeURIComponent(phone)}&accountType=${userType ?? "bidder"}`;
        return;
      }

      showToast("success", "Login successful");
      const destination = userType ? (roleRedirects[userType] ?? "/") : "/";
      window.location.href = destination;
    } catch (error: unknown) {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      showToast("failure", message ?? "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loginAs,
    setLoginAs,
    isLoading,
    handleLogin,
  };
}
