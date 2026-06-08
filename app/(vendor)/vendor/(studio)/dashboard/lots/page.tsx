import { format } from "date-fns";

import { LotsPageContent } from "./_components/lots-page-content";

export default function Page() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  return <LotsPageContent formattedDate={formattedDate} />;
}
