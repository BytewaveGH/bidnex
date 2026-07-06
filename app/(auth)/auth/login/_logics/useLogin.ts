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
  const [rememberMe, setRememberMe] = useState(false);
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
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      console.log("SIGNIN RESULT:", result);

      if (!result || result.error) {
        showToast("failure", result?.code || "Login failed");
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
      const redirectParam = new URLSearchParams(window.location.search).get("redirect");
      const destination =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : userType
            ? (roleRedirects[userType] ?? "/")
            : "/";
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
    rememberMe,
    setRememberMe,
    isLoading,
    handleLogin,
  };
}
