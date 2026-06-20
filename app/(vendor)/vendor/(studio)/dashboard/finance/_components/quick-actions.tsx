import {
  BarChart2,
  ClipboardList,
  Gavel,
  History,
  MoreHorizontal,
  Scale,
  SendHorizontal,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const shortcuts = [
  { id: 1, label: "New Lot", icon: Tag },
  { id: 2, label: "Withdraw", icon: SendHorizontal },
  { id: 3, label: "View Bids", icon: Gavel },
  { id: 4, label: "Payouts", icon: ClipboardList },
  { id: 5, label: "Disputes", icon: Scale },
  { id: 6, label: "Analytics", icon: BarChart2 },
  { id: 7, label: "History", icon: History },
  { id: 8, label: "More", icon: MoreHorizontal },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <div key={shortcut.id} className="flex flex-col items-center gap-2.5">
                <Button variant="outline" className="size-12 rounded-full">
                  <Icon className="size-5" />
                </Button>
                <span className="text-center text-muted-foreground text-xs">{shortcut.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
