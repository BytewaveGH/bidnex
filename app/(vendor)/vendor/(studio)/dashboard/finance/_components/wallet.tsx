"use client";

import { useState } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";

import { showToast } from "@/components/templates/toast-template";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { usePayoutAccounts } from "../_logics/usePayoutAccounts";
import type { PayoutAccount } from "../_logics/usePayoutAccounts";
import { useSetDefaultPayoutAccount } from "../_logics/useSetDefaultPayoutAccount";
import { useDeletePayoutAccount } from "../_logics/useDeletePayoutAccount";
import { AddMomoAccountSheet } from "./add-momo-account-sheet";

const PROVIDER_LABELS: Record<string, string> = {
  MTN: "MTN Mobile Money",
  TELECEL: "Telecel Cash",
  AT: "AT Money",
};

function providerLabel(provider: string) {
  return PROVIDER_LABELS[provider.toUpperCase()] ?? provider;
}

function AccountRow({
  account,
  onRequestSetDefault,
  onRequestDelete,
  isSettingDefault,
}: {
  account: PayoutAccount;
  onRequestSetDefault: (account: PayoutAccount) => void;
  onRequestDelete: (account: PayoutAccount) => void;
  isSettingDefault: boolean;
}) {
  const label = `${providerLabel(account.provider)} • ${account.accountNo}`;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-sm leading-none">{label}</span>
        <span className="text-muted-foreground text-xs">
          {account.isDefault ? "Default account" : account.accountName}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {!account.isDefault && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" disabled={isSettingDefault}>
                {isSettingDefault ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onRequestSetDefault(account)}>
                Set as default
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRequestDelete(account)}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function Wallet() {
  const { data: accounts, isLoading, refetch } = usePayoutAccounts();
  const { setDefault, loadingId } = useSetDefaultPayoutAccount();
  const { deleteAccount } = useDeletePayoutAccount();
  const [pendingAccount, setPendingAccount] = useState<PayoutAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PayoutAccount | null>(null);

  const bankAccounts = (accounts ?? []).filter((a) => a.type === "bank");
  const mobileAccounts = (accounts ?? []).filter((a) => a.type === "mobile_money");

  async function handleConfirmSetDefault() {
    if (!pendingAccount) return;
    const id = pendingAccount.id;
    setPendingAccount(null);
    try {
      await setDefault(id);
      await refetch();
      showToast("success", "Default account updated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update default account.";
      showToast("failure", message);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await deleteAccount(id);
      await refetch();
      showToast("success", "Account removed.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove account.";
      showToast("failure", message);
    }
  }

  const pendingLabel = pendingAccount
    ? `${providerLabel(pendingAccount.provider)} • ${pendingAccount.accountNo}`
    : "";
  const deleteLabel = deleteTarget
    ? `${providerLabel(deleteTarget.provider)} • ${deleteTarget.accountNo}`
    : "";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Payout Accounts</CardTitle>
          <CardAction>
            <AddMomoAccountSheet onSuccess={refetch} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="size-9 rounded-md" />
                </div>
              ))}
            </div>
          ) : accounts?.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No payout accounts added yet. Add one to receive payouts.
            </p>
          ) : (
            <>
              {bankAccounts.length > 0 && (
                <div className="flex flex-col gap-4">
                  {bankAccounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      onRequestSetDefault={setPendingAccount}
                      onRequestDelete={setDeleteTarget}
                      isSettingDefault={loadingId === account.id}
                    />
                  ))}
                </div>
              )}

              {bankAccounts.length > 0 && mobileAccounts.length > 0 && <Separator />}

              {mobileAccounts.length > 0 && (
                <div className="flex flex-col gap-4">
                  {mobileAccounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      onRequestSetDefault={setPendingAccount}
                      onRequestDelete={setDeleteTarget}
                      isSettingDefault={loadingId === account.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingAccount} onOpenChange={(v) => { if (!v) setPendingAccount(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Set as default account?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{pendingLabel}</span> will be used for all future payouts. You can change this at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSetDefault}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove account?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteLabel}</span> will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
