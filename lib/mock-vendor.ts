export const MOCK = process.env.NEXT_PUBLIC_MOCK === 'true'

// Three daily periods: 10am, 1pm, 8pm
// Each lot holds 10 items, ending sequentially 5 min apart from the period time
export const mockLotSlots = [
    { id: 1,  period: '10am', label: 'Today · 10am',     endTime: '2026-05-31T10:00:00Z', capacity: 10, itemCount: 10, available: false },
    { id: 2,  period: '1pm',  label: 'Today · 1pm',      endTime: '2026-05-31T13:00:00Z', capacity: 10, itemCount: 8,  available: true  },
    { id: 3,  period: '8pm',  label: 'Today · 8pm',      endTime: '2026-05-31T20:00:00Z', capacity: 10, itemCount: 5,  available: true  },
    { id: 4,  period: '10am', label: 'Tomorrow · 10am',  endTime: '2026-06-01T10:00:00Z', capacity: 10, itemCount: 0,  available: true  },
    { id: 5,  period: '1pm',  label: 'Tomorrow · 1pm',   endTime: '2026-06-01T13:00:00Z', capacity: 10, itemCount: 0,  available: true  },
    { id: 6,  period: '8pm',  label: 'Tomorrow · 8pm',   endTime: '2026-06-01T20:00:00Z', capacity: 10, itemCount: 0,  available: true  },
]

// Last available lot = latest slot today with space (falls back to next day)
export function getDefaultLotSlot() {
    const available = mockLotSlots.filter(l => l.available && l.itemCount < l.capacity)
    // Prefer today's slots first, pick the latest one
    const today = available.filter(l => l.label.startsWith('Today'))
    if (today.length) return today[today.length - 1]
    return available[0]
}

export const mockCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Furniture & Home' },
    { id: 3, name: 'Vehicles & Parts' },
    { id: 4, name: 'Fashion & Apparel' },
    { id: 5, name: 'Sports & Outdoors' },
    { id: 6, name: 'Books & Media' },
    { id: 7, name: 'Other' },
]

export type ItemStatus = 'pending' | 'active' | 'sold' | 'unsold' | 'cancelled'

export interface VendorItem {
    id: number
    title: string
    description: string
    condition: string
    categoryId: number
    categoryName: string
    startingBid: number
    bidIncrement: number
    buyNowPrice: number
    msrp: number
    quantity: number
    sku: string
    pickupAvailable: boolean
    shippingAvailable: boolean
    deliveryNotes: string
    specs: { key: string; value: string }[]
    status: ItemStatus
    lotId: number
    lotLabel: string
    lotEndTime: string
    itemEndTime: string
    primaryImage: string
    createdAt: string
}

export const mockItems: VendorItem[] = [
    {
        id: 201,
        title: 'iPhone 14 Pro — 256GB Space Black',
        description: 'Minor scratches on back glass. Screen is perfect. All functions working. Battery health 91%.',
        condition: 'like_new',
        categoryId: 1,
        categoryName: 'Electronics',
        startingBid: 500,
        bidIncrement: 50,
        buyNowPrice: 1200,
        msrp: 1800,
        quantity: 1,
        sku: 'SKU-001',
        pickupAvailable: true,
        shippingAvailable: false,
        deliveryNotes: 'Pickup from Accra Mall. Call 30 mins before.',
        specs: [
            { key: 'Storage', value: '256GB' },
            { key: 'Color', value: 'Space Black' },
            { key: 'Battery Health', value: '91%' },
        ],
        status: 'active',
        lotId: 3,
        lotLabel: 'Today · 8pm',
        lotEndTime: '2026-05-31T20:00:00Z',
        itemEndTime: '2026-05-31T20:05:00Z',
        primaryImage: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400',
        createdAt: '2026-05-31T08:00:00Z',
    },
    {
        id: 202,
        title: 'Samsung 65" QLED 4K Smart TV',
        description: 'No remote included. All HDMI and USB ports working. No cracks or dead pixels.',
        condition: 'fully_functional',
        categoryId: 2,
        categoryName: 'Furniture & Home',
        startingBid: 800,
        bidIncrement: 100,
        buyNowPrice: 0,
        msrp: 2500,
        quantity: 1,
        sku: 'SKU-002',
        pickupAvailable: true,
        shippingAvailable: false,
        deliveryNotes: 'Large item. Buyer arranges transport.',
        specs: [
            { key: 'Screen Size', value: '65 inches' },
            { key: 'Resolution', value: '4K UHD' },
            { key: 'Smart TV', value: 'Yes (Tizen OS)' },
        ],
        status: 'active',
        lotId: 3,
        lotLabel: 'Today · 8pm',
        lotEndTime: '2026-05-31T20:00:00Z',
        itemEndTime: '2026-05-31T20:10:00Z',
        primaryImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400',
        createdAt: '2026-05-31T08:15:00Z',
    },
    {
        id: 203,
        title: 'MacBook Air M2 — 8GB/256GB',
        description: 'Battery health 89%. Original charger included. Minor scuff on lid.',
        condition: 'like_new',
        categoryId: 1,
        categoryName: 'Electronics',
        startingBid: 1200,
        bidIncrement: 100,
        buyNowPrice: 2800,
        msrp: 3500,
        quantity: 1,
        sku: 'SKU-003',
        pickupAvailable: true,
        shippingAvailable: true,
        deliveryNotes: 'Can ship nationwide via GIG Logistics.',
        specs: [
            { key: 'Chip', value: 'Apple M2' },
            { key: 'RAM', value: '8GB' },
            { key: 'Storage', value: '256GB SSD' },
            { key: 'Battery Health', value: '89%' },
        ],
        status: 'pending',
        lotId: 2,
        lotLabel: 'Today · 1pm',
        lotEndTime: '2026-05-31T13:00:00Z',
        itemEndTime: '2026-05-31T13:40:00Z',
        primaryImage: 'https://images.unsplash.com/photo-1611186871525-3b8f71e0a46d?w=400',
        createdAt: '2026-05-30T16:00:00Z',
    },
    {
        id: 204,
        title: 'Nike Air Max 270 — Size 42',
        description: 'Worn twice. Original box included.',
        condition: 'like_new',
        categoryId: 4,
        categoryName: 'Fashion & Apparel',
        startingBid: 80,
        bidIncrement: 10,
        buyNowPrice: 200,
        msrp: 350,
        quantity: 1,
        sku: '',
        pickupAvailable: true,
        shippingAvailable: true,
        deliveryNotes: '',
        specs: [
            { key: 'Size', value: '42 EU / 8.5 US' },
            { key: 'Color', value: 'Triple Black' },
        ],
        status: 'sold',
        lotId: 1,
        lotLabel: 'Today · 10am',
        lotEndTime: '2026-05-31T10:00:00Z',
        itemEndTime: '2026-05-31T10:00:00Z',
        primaryImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        createdAt: '2026-05-30T12:00:00Z',
    },
]

export const mockDisputes = [
    {
        id: 1,
        lotId: 201,
        buyerId: 12,
        sellerId: 5,
        reason: 'Item not as described',
        status: 'open' as const,
        outcomeNote: null,
        filedAt: '2026-06-10T12:00:00Z',
        resolvedAt: null,
        createdAt: '2026-06-10T12:00:00Z',
    },
    {
        id: 2,
        lotId: 202,
        buyerId: 14,
        sellerId: 5,
        reason: 'Item arrived damaged',
        status: 'under_review' as const,
        outcomeNote: null,
        filedAt: '2026-06-08T09:30:00Z',
        resolvedAt: null,
        createdAt: '2026-06-08T09:30:00Z',
    },
    {
        id: 3,
        lotId: 204,
        buyerId: 9,
        sellerId: 5,
        reason: 'Missing accessories',
        status: 'resolved_no_action' as const,
        outcomeNote: 'Buyer confirmed accessories were included in secondary package.',
        filedAt: '2026-05-25T14:00:00Z',
        resolvedAt: '2026-05-27T10:00:00Z',
        createdAt: '2026-05-25T14:00:00Z',
    },
]

export const mockDisputeMessages: {
    id: number;
    disputeId: number;
    senderId: number;
    message: string;
    attachments: string[];
    createdAt: string;
}[] = [
    {
        id: 1,
        disputeId: 1,
        senderId: 12,
        message: 'The item I received looks nothing like the photos. The screen has a large crack.',
        attachments: [],
        createdAt: '2026-06-10T12:05:00Z',
    },
    {
        id: 2,
        disputeId: 1,
        senderId: 5,
        message: 'Thank you for reaching out. The item was listed as "like new" and was inspected before delivery. Can you share photos of the damage?',
        attachments: [],
        createdAt: '2026-06-10T13:00:00Z',
    },
]

/** Set to true only for local UI preview without APIs. */
export const VENDOR_DISPUTES_USE_SAMPLE_DATA = false;

export function getMockVendorDisputesPage(page: number, limit: number, status?: string) {
    const filtered = status
        ? mockDisputes.filter((d) => d.status === status)
        : mockDisputes;
    const start = (page - 1) * limit;
    return {
        count: filtered.length,
        page,
        limit,
        data: filtered.slice(start, start + limit),
    };
}

export function getMockVendorDisputeDetail(id: number) {
    const dispute = mockDisputes.find((d) => d.id === id);
    if (!dispute) return null;
    const messages = mockDisputeMessages.filter((m) => m.disputeId === id);
    return { ...dispute, messages };
}

export function addMockVendorDisputeMessage(
    disputeId: number,
    payload: { message: string; attachments: string[] },
) {
    const existing = getMockVendorDisputeDetail(disputeId);
    if (!existing) return null;
    const nextMessage = {
        id: (existing.messages?.length ?? 0) + 1,
        disputeId,
        senderId: 5,
        message: payload.message,
        attachments: payload.attachments,
        createdAt: new Date().toISOString(),
    };
    mockDisputeMessages.push(nextMessage);
    return { ...existing, messages: [...(existing.messages ?? []), nextMessage] };
}
