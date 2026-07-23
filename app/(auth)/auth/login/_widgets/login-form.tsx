"use client";

import React, { useState } from "react";
import { ChevronLeft, Eye, EyeOff, Gavel, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import InputTemplate from "@/components/templates/input-template";
import ButtonTemplate from "@/components/templates/button-template";
import Link from "next/link";
import { CheckboxTemplate } from "@/components/templates/checkbox-template";
import { cn } from "@/lib/utils";
import { useLogin } from "../_logics/useLogin";

const ROLE_OPTIONS = [
  { value: "bidder" as const, title: "Bidder", description: "Bid & buy items", icon: Gavel },
  { value: "vendor" as const, title: "Vendor", description: "Sell your items", icon: Store },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g fill="none" fillRule="evenodd">
        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </g>
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const {
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
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [step, setStep] = useState<"role" | "credentials">("role");

  function selectRole(role: "bidder" | "vendor") {
    setLoginAs(role);
    setStep("credentials");
  }

  const handleGoogleSignIn = async () => {
    setIsSocialLoading(true);
    document.cookie = `social_auth_role=${loginAs}; path=/; max-age=300; SameSite=Lax`;
    await signIn("google", { callbackUrl: "/auth/social-callback" });
  };

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
            className="text-base text-[#13161A] font-normal underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {step === "role" ? (
        <div key="role" className="w-full max-w-[550px] animate-in fade-in slide-in-from-left-4 duration-300">
          <p className="text-lg font-semibold text-[#13161A] mb-3">Log in as</p>
          <div className="flex gap-4">
            {ROLE_OPTIONS.map(({ value, title, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => selectRole(value)}
                className="flex-1 h-32 rounded-xl border-2 border-[#E4E7EC] hover:border-[#13161A] transition-colors p-4 flex flex-col items-start justify-between text-left cursor-pointer"
              >
                <Icon className="size-6 text-[#13161A]" />
                <div>
                  <p className="font-semibold text-[#13161A]">{title}</p>
                  <p className="text-xs text-[#667185]">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form
          key="credentials"
          className="w-full max-w-[550px] animate-in fade-in slide-in-from-right-4 duration-300"
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
        >
          <button
            type="button"
            onClick={() => setStep("role")}
            className="group inline-flex items-center gap-1.5 mb-6 pl-2 pr-3 py-1.5 rounded-full border border-[#E4E7EC] hover:border-[#13161A] transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-3.5 text-[#667185] group-hover:text-[#13161A] transition-colors" />
            {(() => {
              const Icon = ROLE_OPTIONS.find((r) => r.value === loginAs)?.icon ?? Gavel;
              return <Icon className="size-3.5 text-[#13161A]" />;
            })()}
            <span className="text-xs font-semibold capitalize text-[#13161A]">{loginAs}</span>
          </button>

          <div className=" flex flex-col gap-6 mb-2">
            <InputTemplate
              label="Email Address / Phone Number"
              placeholder={"Enter your email address or phone number"}
              className="h-11"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="username"
              autoComplete="username"
            />
            <InputTemplate
              label="Password"
              placeholder={"Enter your password"}
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={
                showPassword ? (
                  <Eye className="w-4 h-4 text-[#667185] hover:cursor-pointer" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#667185] hover:cursor-pointer" />
                )
              }
              onIconClick={() => setShowPassword((prev) => !prev)}
              align="inline-end"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
            />
          </div>
          <div className="flex justify-between items-center mb-10">
            <CheckboxTemplate
              label="Remember me"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
            />
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
            disabled={isLoading || isSocialLoading}
          />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E4E7EC]" />
            <span className="text-sm text-[#98A2B3]">or</span>
            <div className="flex-1 h-px bg-[#E4E7EC]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isSocialLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {isSocialLoading ? "Redirecting..." : "Continue with Google"}
          </button>
        </form>
      )}
    </div>
  );
}
