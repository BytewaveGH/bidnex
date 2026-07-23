"use client";

import { useState } from "react";

import { BadgeCheck, Bell, Check, CreditCard, LogOut, Repeat } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { SwitchAccountDialog } from "@/components/generals/switch-account/switch-account-dialog";

const OTHER_ROLE: Record<string, "vendor" | "bidder"> = {
  vendor: "bidder",
  bidder: "vendor",
};

const OTHER_ROLE_LABEL: Record<"vendor" | "bidder", string> = {
  vendor: "Sell your items",
  bidder: "Switch to bidding",
};

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const { data: session } = useSession();
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const activeUser = users[0];

  if (!activeUser) {
    return null;
  }

  const otherRole = OTHER_ROLE[activeUser.role];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
            <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
          <DropdownMenuItem className="p-0" aria-current="true">
            <div className="flex w-full items-center gap-2 px-1 py-1.5">
              <Avatar className="size-9 rounded-lg">
                <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
                <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeUser.name}</span>
                <span className="truncate text-xs capitalize">{activeUser.role}</span>
              </div>
              <span className="mr-1 flex size-5 items-center justify-center rounded-full text-primary">
                <Check aria-hidden="true" />
              </span>
            </div>
          </DropdownMenuItem>
          {otherRole && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSwitchDialogOpen(true)}>
                <Repeat />
                {OTHER_ROLE_LABEL[otherRole]}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {otherRole && (
        <SwitchAccountDialog
          open={switchDialogOpen}
          onOpenChange={setSwitchDialogOpen}
          username={session?.user?.username ?? activeUser.email}
          targetRole={otherRole}
        />
      )}
    </>
  );
}
