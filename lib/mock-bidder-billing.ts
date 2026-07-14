import type { Dispute, DisputeDetail, DisputesPage } from "@/app/(bidder)/bidder/(billing)/_logics/disputes";
import type { Receipt } from "@/app/(bidder)/bidder/(billing)/_logics/useReceipts";

/** Set to true only for local UI preview without APIs. */
export const BILLING_USE_SAMPLE_DATA = false;

export const mockReceipts: Receipt[] = [
  {
    reference: "PAY-2026-04821",
    paidAt: "2026-07-05T14:32:00Z",
    subtotal: 1250,
    fee: 6,
    total: 1256,
    lots: [
      {
        id: 14,
        title: "Samsung Galaxy S24 Ultra — 256GB, Phantom Black",
        amount: 850,
        fee: 3,
      },
      {
        id: 22,
        title: "Sony WH-1000XM5 Wireless Headphones",
        amount: 400,
        fee: 3,
      },
    ],
  },
  {
    reference: "PAY-2026-03107",
    paidAt: "2026-06-18T09:15:00Z",
    subtotal: 320,
    fee: 3,
    total: 323,
    lots: [
      {
        id: 31,
        title: "Vintage Leather Messenger Bag — Brown",
        amount: 320,
        fee: 3,
      },
    ],
  },
];

export const mockDisputesPage: DisputesPage = {
  count: 3,
  page: 1,
  limit: 10,
  data: [
    {
      id: 1,
      lotId: 14,
      lotTitle: "Samsung Galaxy S24 Ultra — 256GB, Phantom Black",
      reason: "Item not as described",
      description:
        "The phone has visible scratches on the screen that were not shown in the listing photos. Battery health also reads 78% instead of the advertised 95%+.",
      status: "open",
      outcomeNote: null,
      filedAt: "2026-07-06T10:00:00Z",
      resolvedAt: null,
      createdAt: "2026-07-06T10:00:00Z",
      messageCount: 3,
    },
    {
      id: 2,
      lotId: 22,
      lotTitle: "Sony WH-1000XM5 Wireless Headphones",
      reason: "Item arrived damaged",
      description:
        "Left ear cup hinge is cracked and the noise cancellation does not work on one side.",
      status: "under_review",
      outcomeNote: null,
      filedAt: "2026-07-04T16:20:00Z",
      resolvedAt: null,
      createdAt: "2026-07-04T16:20:00Z",
      messageCount: 1,
    },
    {
      id: 3,
      lotId: 31,
      lotTitle: "Vintage Leather Messenger Bag — Brown",
      reason: "Missing accessories",
      description: "Shoulder strap was not included in the package.",
      status: "resolved_no_action",
      outcomeNote: "Vendor confirmed strap was shipped separately; buyer received it on 20 Jun.",
      filedAt: "2026-06-20T11:00:00Z",
      resolvedAt: "2026-06-22T09:30:00Z",
      createdAt: "2026-06-20T11:00:00Z",
      messageCount: 2,
    },
  ],
};

export const mockDisputeDetails: Record<number, DisputeDetail> = {
  1: {
    ...mockDisputesPage.data[0],
    messages: [
      {
        id: 1,
        disputeId: 1,
        senderId: 12,
        message:
          "The item I received looks nothing like the photos. The screen has a large crack and the back glass is chipped.",
        attachments: [
          "https://images.unsplash.com/photo-1580910051074-3eb69488622f?w=800",
        ],
        createdAt: "2026-07-06T10:05:00Z",
      },
      {
        id: 2,
        disputeId: 1,
        senderId: 5,
        message:
          "Thank you for reaching out. The item was listed as 'like new' and was inspected before shipping. Can you share more photos of the damage?",
        attachments: [],
        createdAt: "2026-07-06T14:00:00Z",
      },
      {
        id: 3,
        disputeId: 1,
        senderId: 12,
        message:
          "Tracto chirographum depopulo acervus nihil quasi asporto texo vilis. Aperiam teneo credo teneo vindico thymum distinctio curia ducimus. Omnis thermae communis avaritia.",
        attachments: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800",
        ],
        createdAt: "2026-07-07T08:30:00Z",
      },
    ],
  },
  2: {
    ...mockDisputesPage.data[1],
    messages: [
      {
        id: 4,
        disputeId: 2,
        senderId: 12,
        message: "Headphones arrived with a cracked hinge. NC only works on the right side.",
        attachments: [
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
        ],
        createdAt: "2026-07-04T16:25:00Z",
      },
    ],
  },
  3: {
    ...mockDisputesPage.data[2],
    messages: [
      {
        id: 5,
        disputeId: 3,
        senderId: 12,
        message: "No shoulder strap in the box.",
        attachments: [],
        createdAt: "2026-06-20T11:05:00Z",
      },
      {
        id: 6,
        disputeId: 3,
        senderId: 5,
        message: "Strap was in a separate parcel — tracking shared via email.",
        attachments: [],
        createdAt: "2026-06-21T09:00:00Z",
      },
    ],
  },
};

export function getMockDisputesPage(page: number, limit: number): DisputesPage {
  const start = (page - 1) * limit;
  const data = mockDisputesPage.data.slice(start, start + limit);
  return {
    count: mockDisputesPage.data.length,
    page,
    limit,
    data,
  };
}

export function getMockDisputeDetail(id: number): DisputeDetail | null {
  return mockDisputeDetails[id] ?? null;
}

export function findMockLotTitle(lotId: number): string | undefined {
  for (const receipt of mockReceipts) {
    const lot = receipt.lots.find((item) => item.id === lotId);
    if (lot) return lot.title;
  }
  return undefined;
}

/** In-memory store for demo submissions while sample mode is on. */
let demoDisputeIdCounter = 100;
const demoDisputes: Dispute[] = [];
const demoDisputeDetails: Record<number, DisputeDetail> = {};

export function addDemoDispute(payload: {
  lotId: number;
  reason: string;
  description: string;
}): DisputeDetail {
  const id = demoDisputeIdCounter++;
  const dispute: DisputeDetail = {
    id,
    lotId: payload.lotId,
    lotTitle: findMockLotTitle(payload.lotId) ?? `Lot #${payload.lotId}`,
    reason: payload.reason,
    description: payload.description,
    status: "open",
    outcomeNote: null,
    filedAt: new Date().toISOString(),
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 1,
        disputeId: id,
        senderId: 12,
        message: payload.description,
        attachments: [],
        createdAt: new Date().toISOString(),
      },
    ],
  };

  demoDisputes.unshift(dispute);
  demoDisputeDetails[id] = dispute;
  return dispute;
}

export function addDemoDisputeMessage(
  disputeId: number,
  payload: { message: string; attachments: string[] },
): DisputeDetail | null {
  const existing =
    demoDisputeDetails[disputeId] ?? mockDisputeDetails[disputeId] ?? null;
  if (!existing) return null;

  const nextMessage = {
    id: (existing.messages?.length ?? 0) + 1,
    disputeId,
    senderId: 12,
    message: payload.message,
    attachments: payload.attachments,
    createdAt: new Date().toISOString(),
  };

  const updated: DisputeDetail = {
    ...existing,
    messages: [...(existing.messages ?? []), nextMessage],
  };

  demoDisputeDetails[disputeId] = updated;
  return updated;
}

export function getAllDemoDisputes(): Dispute[] {
  return [...demoDisputes, ...mockDisputesPage.data];
}

export function getDemoDisputeDetail(id: number): DisputeDetail | null {
  return demoDisputeDetails[id] ?? mockDisputeDetails[id] ?? null;
}
