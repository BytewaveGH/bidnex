"use client";

import { useState } from "react";
import { showToast } from "@/components/templates/toast-template";
import { useUnauthenticatedAxios } from "@/hooks/use-axios";

export function useLogin() {
  const callApi = useUnauthenticatedAxios();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log("LOGIN BUTTON CLICKED");
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
      console.log("API URL =", process.env.NEXT_PUBLIC_API_URL);
      console.log("LOGIN URL =", "/auth/login");
      const response: any = await callApi({
        method: "POST",
        url: "/auth/login",
        data: {
          username,
          password,
        },
      });

      console.log("LOGIN RESPONSE:", response);

      if (response.status >= 400) {
        showToast("failure", response.data?.error || "Login failed");
        return;
      }

      showToast("success", "Login successful");
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
    isLoading,
    handleLogin,
  };
}
