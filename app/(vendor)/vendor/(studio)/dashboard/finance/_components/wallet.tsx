"use client";

import { Building2, Plus, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { usePayoutAccounts } from "../_logics/usePayoutAccounts";
import type { PayoutAccount } from "../_logics/usePayoutAccounts";

function AccountRow({ account }: { account: PayoutAccount }) {
  const Icon = account.type === "mobile_money" ? Smartphone : Building2;
  const label = account.last4
    ? `${account.name} • **** ${account.last4}`
    : account.number
      ? `${account.name} • ${account.number}`
      : account.name;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-sm leading-none">{label}</span>
        {account.isDefault && (
          <span className="font-normal text-muted-foreground text-xs">Default account</span>
        )}
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
        <Icon className="size-4" />
      </div>
    </div>
  );
}

export function Wallet() {
  const { data: accounts, isLoading } = usePayoutAccounts();

  const bankAccounts = (accounts ?? []).filter((a) => a.type === "bank");
  const mobileAccounts = (accounts ?? []).filter((a) => a.type === "mobile_money");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Payout Accounts</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            <Plus />
            Add Account
          </Button>
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
                  <AccountRow key={account.id} account={account} />
                ))}
              </div>
            )}

            {bankAccounts.length > 0 && mobileAccounts.length > 0 && <Separator />}

            {mobileAccounts.length > 0 && (
              <div className="flex flex-col gap-4">
                {mobileAccounts.map((account) => (
                  <AccountRow key={account.id} account={account} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
