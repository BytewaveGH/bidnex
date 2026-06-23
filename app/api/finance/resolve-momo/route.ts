import { NextRequest, NextResponse } from "next/server";

const CHANNEL_MAP: Record<string, string> = {
  mtn: "1",
  telecel: "6",
  at: "7",
};

export async function POST(req: NextRequest) {
  const { network, number } = await req.json();

  const channel = CHANNEL_MAP[network as string];
  if (!channel) {
    return NextResponse.json({ message: "Invalid network." }, { status: 400 });
  }

  const apiUser = process.env.MOOLRE_API_USER;
  const apiKey = process.env.MOOLRE_API_KEY;
  const accountNumber = process.env.MOOLRE_ACCOUNT_NUMBER;

  if (!apiUser || !apiKey || !accountNumber) {
    console.error("[resolve-momo] Missing MOOLRE env vars");
    return NextResponse.json({ message: "Payment provider not configured." }, { status: 500 });
  }

  const response = await fetch("https://api.moolre.com/open/transact/validate", {
    method: "POST",
    headers: {
      "X-API-USER": apiUser,
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: 1,
      receiver: number,
      channel,
      sublistid: "",
      currency: "GHS",
      accountnumber: accountNumber,
    }),
  });

  const json = await response.json().catch(() => null);

  if (!json || json.status !== 1 || !json.data) {
    const message = json?.message ?? "Could not verify this number. Please check and try again.";
    return NextResponse.json({ message }, { status: 400 });
  }

  return NextResponse.json({ name: json.data as string });
}
