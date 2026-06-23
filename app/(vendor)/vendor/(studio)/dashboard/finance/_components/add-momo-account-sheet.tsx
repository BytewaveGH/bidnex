"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Plus, XCircle } from "lucide-react";

import { showToast } from "@/components/templates/toast-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useAddPayoutAccount } from "../_logics/useAddPayoutAccount";

const NETWORKS = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "telecel", label: "Telecel Cash" },
  { value: "at", label: "AT Money" },
] as const;

type Network = (typeof NETWORKS)[number]["value"];

const VALID_GH_NUMBER = /^(0[2-9]\d{8}|\+233[2-9]\d{8})$/;

const schema = z.object({
  network: z.enum(["mtn", "telecel", "at"], { error: "Select a network" }),
  number: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (v) => VALID_GH_NUMBER.test(v.replace(/\s+/g, "")),
      "Enter a valid 10-digit Ghana mobile number (e.g. 0241234567)",
    ),
});

type FormValues = z.infer<typeof schema>;

type NameStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "resolved"; name: string }
  | { state: "error"; message: string };

export function AddMomoAccountSheet({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [nameStatus, setNameStatus] = useState<NameStatus>({ state: "idle" });

  const { addAccount, isLoading: isSaving } = useAddPayoutAccount();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const network = watch("network");
  const rawNumber = watch("number") ?? "";
  const number = rawNumber.replace(/\s+/g, "");

  // Auto-resolve name when both network and a valid number are present
  useEffect(() => {
    setNameStatus({ state: "idle" });

    if (!network || !VALID_GH_NUMBER.test(number)) return;

    setNameStatus({ state: "loading" });

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/finance/resolve-momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ network, number }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "Could not verify this number.");
        setNameStatus({ state: "resolved", name: json.name });
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Could not verify this number.";
        setNameStatus({ state: "error", message });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [network, number]);

  function handleOpenChange(v: boolean) {
    if (!v) {
      setOpen(false);
      reset();
      setNameStatus({ state: "idle" });
    } else {
      setOpen(true);
    }
  }

  async function onSubmit(values: FormValues) {
    if (nameStatus.state !== "resolved") return;
    try {
      await addAccount({
        type: "mobile_money",
        provider: values.network.toUpperCase(),
        accountNo: values.number.replace(/\s+/g, ""),
        accountName: nameStatus.name,
      });
      showToast("success", "MoMo account added successfully.");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save account.";
      showToast("failure", message);
    }
  }

  const showNameField = nameStatus.state !== "idle";
  const canSubmit = nameStatus.state === "resolved" && !isSaving;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          Add Account
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader className="shrink-0 px-6 py-4">
          <SheetTitle>Add MoMo Account</SheetTitle>
          <SheetDescription>
            Add a Ghana Mobile Money number to receive payouts.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-1.5">
              <Label>Network</Label>
              <Select
                onValueChange={(v) => setValue("network", v as Network, { shouldValidate: true })}
              >
                <SelectTrigger size="lg" className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.network && (
                <p className="text-destructive text-xs">{errors.network.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Mobile Number</Label>
              <Input
                className="h-11"
                placeholder="0241234567"
                inputMode="tel"
                {...register("number")}
              />
              {errors.number ? (
                <p className="text-destructive text-xs">{errors.number.message}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Enter the number registered with your MoMo wallet.
                </p>
              )}
            </div>

            {showNameField && (
              <div className="flex flex-col gap-1.5">
                <Label>Account Name</Label>
                <div className="flex h-11 items-center gap-2.5 rounded-md border bg-muted/40 px-3">
                  {nameStatus.state === "loading" && (
                    <>
                      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Looking up account…</span>
                    </>
                  )}
                  {nameStatus.state === "resolved" && (
                    <>
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      <span className="font-medium text-sm">{nameStatus.name}</span>
                    </>
                  )}
                  {nameStatus.state === "error" && (
                    <>
                      <XCircle className="size-4 shrink-0 text-destructive" />
                      <span className="text-destructive text-sm">{nameStatus.message}</span>
                    </>
                  )}
                </div>
                {nameStatus.state === "resolved" && (
                  <p className="text-muted-foreground text-xs">
                    Confirm this is the correct account holder before saving.
                  </p>
                )}
              </div>
            )}
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button size="lg" type="submit" className="h-11" disabled={!canSubmit}>
              {isSaving ? "Saving…" : "Add Account"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
