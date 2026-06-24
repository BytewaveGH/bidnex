import Link from "next/link";

import { siWhatsapp } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Looking for something more?</CardTitle>
        <CardDescription>
          Open an issue or do reach out to us on&nbsp;
          <Link
            href="https://x.com/arhamkhnz"
            target="_blank"
            rel="noreferrer"
            aria-label="Reach out on WhatsApp"
            className="inline-flex items-center text-foreground"
          >
            <SimpleIcon icon={siWhatsapp} aria-hidden className="size-3 fill-current" />
          </Link>
          
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
