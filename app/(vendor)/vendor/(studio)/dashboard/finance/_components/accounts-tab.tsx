"use client";

import * as React from "react";

import { format, parseISO } from "date-fns";
import { Building2, MoreHorizontal, Plus, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const bankAccounts = [
  { id: "acct-001", bank: "GCB Bank", last4: "4182", balance: "GHS 12,450.60", isDefault: true, Icon: Building2 },
  { id: "acct-002", bank: "Ecobank Ghana", last4: "1004", balance: "GHS 3,200.11", isDefault: false, Icon: Building2 },
  { id: "acct-003", bank: "Stanbic Bank", last4: "9912", balance: "GHS 2,749.29", isDefault: false, Icon: Building2 },
];

const mobileMoney = [
  { id: "mm-001", name: "MTN Mobile Money", number: "055 *** 4821", balance: "GHS 1,840.00", isDefault: false, Icon: Smartphone },
  { id: "mm-002", name: "Vodafone Cash", number: "020 *** 7134", balance: "GHS 160.00", isDefault: false, Icon: Smartphone },
];

const recentPayouts = [
  { id: "TXN-0042", date: "2026-06-17T09:00:00Z", account: "GCB Bank **** 4182", amount: -12450, status: "Completed" },
  { id: "TXN-0034", date: "2026-06-11T09:10:00Z", account: "MTN MoMo 055 *** 4821", amount: -8200, status: "Completed" },
  { id: "TXN-0027", date: "2026-06-06T09:30:00Z", account: "GCB Bank **** 4182", amount: -14300, status: "Completed" },
  { id: "TXN-0021", date: "2026-06-01T10:00:00Z", account: "Ecobank **** 1004", amount: -9800, status: "Completed" },
  { id: "TXN-0011", date: "2026-05-20T08:00:00Z", account: "MTN MoMo 055 *** 4821", amount: -11200, status: "Failed" },
];

function StatusDot({ status }: { status: string }) {
  if (status === "Completed") {
    return <Badge className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300" variant="outline"><span className="size-1.5 rounded-full bg-current" />Completed</Badge>;
  }
  return <Badge variant="destructive"><span className="size-1.5 rounded-full bg-current" />Failed</Badge>;
}

export function AccountsTab() {
  const [schedule, setSchedule] = React.useState("weekly");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Payout Accounts */}
      <div className="xl:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Payout Accounts</CardTitle>
            <Button size="sm" variant="outline" className="ml-auto">
              <Plus className="size-4" />
              Add Account
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Bank Accounts</p>
              {bankAccounts.map((acct) => (
                <div key={acct.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <acct.Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm leading-none">{acct.bank} &bull; **** {acct.last4}</span>
                        {acct.isDefault && (
                          <Badge className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300 h-4 px-1.5 text-[10px]" variant="outline">Default</Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">{acct.balance}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>Set as default</DropdownMenuItem>
                      <DropdownMenuItem>View history</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Mobile Money</p>
              {mobileMoney.map((mm) => (
                <div key={mm.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <mm.Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm leading-none">{mm.name} &bull; {mm.number}</span>
                      <span className="text-muted-foreground text-xs">{mm.balance}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>Set as default</DropdownMenuItem>
                      <DropdownMenuItem>View history</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4 xl:col-span-7">
        {/* Payout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Default payout account</Label>
              <Select defaultValue="acct-001">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acct-001">GCB Bank **** 4182</SelectItem>
                  <SelectItem value="acct-002">Ecobank Ghana **** 1004</SelectItem>
                  <SelectItem value="acct-003">Stanbic Bank **** 9912</SelectItem>
                  <SelectItem value="mm-001">MTN Mobile Money 055 *** 4821</SelectItem>
                  <SelectItem value="mm-002">Vodafone Cash 020 *** 7134</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Payout schedule</Label>
              <ToggleGroup
                className="bg-muted p-0.75 w-fit **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
                onValueChange={(v) => { if (v) setSchedule(v); }}
                size="sm"
                spacing={1}
                type="single"
                value={schedule}
              >
                <ToggleGroupItem value="manual">Manual</ToggleGroupItem>
                <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
                <ToggleGroupItem value="biweekly">Bi-weekly</ToggleGroupItem>
                <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              </ToggleGroup>
              <p className="text-muted-foreground text-xs">
                {schedule === "manual"
                  ? "Payouts are only processed when you manually request one."
                  : `Your balance is automatically paid out every ${schedule === "biweekly" ? "two weeks" : schedule}.`}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Minimum payout threshold</Label>
              <div className="flex items-center gap-3">
                <Field orientation="horizontal" className="flex-1">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>GHS</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput defaultValue="500.00" />
                  </InputGroup>
                </Field>
                <Button>Save</Button>
              </div>
              <p className="text-muted-foreground text-xs">Payouts will only process when your balance exceeds this amount.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {recentPayouts.map((payout, index) => (
              <div key={payout.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm leading-none">{payout.account}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(parseISO(payout.date), "d MMM yyyy")} &bull; {payout.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium tabular-nums text-sm">
                      GHS {Math.abs(payout.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                    </span>
                    <StatusDot status={payout.status} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
