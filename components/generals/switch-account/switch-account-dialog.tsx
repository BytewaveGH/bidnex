"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputTemplate from "@/components/templates/input-template";
import ButtonTemplate from "@/components/templates/button-template";
import { useSwitchAccount } from "./useSwitchAccount";

const ROLE_COPY: Record<"vendor" | "bidder", { title: string; description: string }> = {
  vendor: {
    title: "Switch to selling",
    description: "Confirm your password to switch this account over to vendor mode.",
  },
  bidder: {
    title: "Switch to bidding",
    description: "Confirm your password to switch this account over to bidder mode.",
  },
};

export function SwitchAccountDialog({
  open,
  onOpenChange,
  username,
  targetRole,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly username: string;
  readonly targetRole: "vendor" | "bidder";
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { password, setPassword, isLoading, switchAccount } = useSwitchAccount(targetRole);
  const copy = ROLE_COPY[targetRole];

  function handleOpenChange(next: boolean) {
    if (!next) setPassword("");
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await switchAccount(username);
    if (ok) handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <InputTemplate
              label="Password"
              placeholder="Enter your password"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={
                showPassword ? (
                  <Eye className="w-4 h-4 text-[#667185]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#667185]" />
                )
              }
              onIconClick={() => setShowPassword((prev) => !prev)}
              align="inline-end"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="h-9 px-4 rounded-lg border border-[#E4E7EC] text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              Cancel
            </button>
            <ButtonTemplate type="submit" title={isLoading ? "Switching…" : "Switch"} disabled={isLoading} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
