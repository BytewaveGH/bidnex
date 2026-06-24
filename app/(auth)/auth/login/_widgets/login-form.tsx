"use client";

import React, { useState } from "react";
import { EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import InputTemplate from "@/components/templates/input-template";
import ButtonTemplate from "@/components/templates/button-template";
import Link from "next/link";
import { CheckboxTemplate } from "@/components/templates/checkbox-template";
import { useLogin } from "../_logics/useLogin";

export default function LoginForm() {
  const router = useRouter();
  const {
    username,
    setUsername,
    password,
    setPassword,
    loginAs,
    setLoginAs,
    isLoading,
    handleLogin,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full px-6 py-10 md:py-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Welcome Back!
        </h1>
        <p className="text-base text-[#657688] font-normal">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-base text-[#13161A] font-normal"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Form */}
      <form className="w-full max-w-[550px]" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        {/* Login as radio */}
        <div className="flex gap-6 mb-6">
          {(["bidder", "vendor"] as const).map((role) => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="loginAs"
                value={role}
                checked={loginAs === role}
                onChange={() => setLoginAs(role)}
                className="accent-[#13161A]"
              />
              <span className="text-sm font-medium text-[#13161A] capitalize">{role}</span>
            </label>
          ))}
        </div>

        <div className=" flex flex-col gap-6 mb-2">
          <InputTemplate
            label="Email Address / Phone Number"
            placeholder={"Enter your email address or phone number"}
            className="h-11"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputTemplate
            label="Password"
            placeholder={"Enter your password"}
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <EyeOff className="w-4 h-4 text-[#667185] hover:cursor-pointer" />
            }
            align="inline-end"
          />
        </div>
        <div className="flex justify-between items-center mb-10">
          <CheckboxTemplate label="Remember me" />
          <div
            onClick={() => router.push("/auth/forgot-password")}
            className="text-sm text-[#475367] font-normal underline hover:cursor-pointer"
          >
            Forgot Password?
          </div>
        </div>
        <ButtonTemplate
          title={isLoading ? "Signing In..." : "Sign In"}
          className="w-full h-11"
          type="submit"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
