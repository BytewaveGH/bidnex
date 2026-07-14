export type DisputeStatus =
  | "open"
  | "under_review"
  | "resolved_no_action"
  | "resolved_refund"
  | string;

export type Dispute = {
  id: number;
  lotId: number;
  buyerId?: number;
  sellerId?: number;
  reason: string;
  description?: string;
  status: DisputeStatus;
  outcomeNote?: string | null;
  filedAt?: string;
  resolvedAt?: string | null;
  createdAt: string;
  lotTitle?: string;
  messageCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: number;
};

export type DisputeMessage = {
  id: number;
  disputeId: number;
  senderId: number;
  message: string;
  attachments?: string[];
  createdAt: string;
};

export type DisputeDetail = Dispute & {
  messages?: DisputeMessage[];
};

export type DisputesPage = {
  count: number;
  page: number;
  limit: number;
  data: Dispute[];
};

export type DisputesApiResponse = {
  data: DisputesPage;
  status: boolean;
};

export type DisputeDetailApiResponse = {
  data: DisputeDetail;
  status: boolean;
};

export type CreateDisputePayload = {
  lotId: number;
  reason: string;
  description: string;
};

export type AddDisputeMessagePayload = {
  message: string;
  attachments: string[];
};

export function formatDisputeStatus(status: DisputeStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeDisputeMessage(raw: Record<string, unknown>): DisputeMessage {
  return {
    id: Number(raw.id ?? 0),
    disputeId: Number(raw.disputeId ?? raw.dispute_id ?? 0),
    senderId: Number(raw.senderId ?? raw.sender_id ?? 0),
    message: String(raw.message ?? ""),
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.map((item) => String(item))
      : [],
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

function getMessageCount(raw: Record<string, unknown>): number | undefined {
  if (raw.messageCount != null) return Number(raw.messageCount);
  if (raw.message_count != null) return Number(raw.message_count);
  if (raw.messagesCount != null) return Number(raw.messagesCount);
  if (Array.isArray(raw.messages)) return raw.messages.length;
  return undefined;
}

function getLastMessageFields(raw: Record<string, unknown>) {
  const last = raw.lastMessage ?? raw.last_message ?? raw.latestMessage ?? raw.latest_message;

  if (typeof last === "string" && last.trim()) {
    return { lastMessage: last.trim() };
  }

  if (last && typeof last === "object") {
    const obj = last as Record<string, unknown>;
    const message = String(obj.message ?? obj.text ?? "").trim();
    if (!message) return {};
    return {
      lastMessage: message,
      lastMessageAt: obj.createdAt
        ? String(obj.createdAt)
        : obj.created_at
          ? String(obj.created_at)
          : undefined,
      lastMessageSenderId:
        obj.senderId != null
          ? Number(obj.senderId)
          : obj.sender_id != null
            ? Number(obj.sender_id)
            : undefined,
    };
  }

  if (Array.isArray(raw.messages) && raw.messages.length > 0) {
    const msg = raw.messages[raw.messages.length - 1] as Record<string, unknown>;
    const message = String(msg.message ?? msg.text ?? "").trim();
    if (!message) return {};
    return {
      lastMessage: message,
      lastMessageAt: msg.createdAt
        ? String(msg.createdAt)
        : msg.created_at
          ? String(msg.created_at)
          : undefined,
      lastMessageSenderId:
        msg.senderId != null
          ? Number(msg.senderId)
          : msg.sender_id != null
            ? Number(msg.sender_id)
            : undefined,
    };
  }

  return {};
}

export function normalizeDispute(raw: Record<string, unknown>): Dispute {
  return {
    id: Number(raw.id ?? 0),
    lotId: Number(raw.lotId ?? raw.lot_id ?? 0),
    buyerId: raw.buyerId !== undefined ? Number(raw.buyerId) : undefined,
    sellerId: raw.sellerId !== undefined ? Number(raw.sellerId) : undefined,
    reason: String(raw.reason ?? ""),
    description: raw.description ? String(raw.description) : undefined,
    status: String(raw.status ?? "open"),
    outcomeNote:
      raw.outcomeNote != null
        ? String(raw.outcomeNote)
        : raw.outcome_note != null
          ? String(raw.outcome_note)
          : null,
    filedAt: raw.filedAt ? String(raw.filedAt) : raw.filed_at ? String(raw.filed_at) : undefined,
    resolvedAt: raw.resolvedAt ? String(raw.resolvedAt) : raw.resolved_at ? String(raw.resolved_at) : null,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    lotTitle: raw.lotTitle ? String(raw.lotTitle) : raw.lot_title ? String(raw.lot_title) : undefined,
    messageCount: getMessageCount(raw),
    ...getLastMessageFields(raw),
  };
}

export function normalizeDisputeDetail(raw: Record<string, unknown>): DisputeDetail {
  const dispute = normalizeDispute(raw);
  const messagesRaw = raw.messages ?? raw.thread ?? [];
  const messages = Array.isArray(messagesRaw)
    ? messagesRaw.map((item) => normalizeDisputeMessage(item as Record<string, unknown>))
    : [];

  return { ...dispute, messages };
}

export function normalizeDisputesPage(
  payload: unknown,
  page: number,
  limit: number,
): DisputesPage {
  if (!payload || typeof payload !== "object") {
    return { count: 0, page, limit, data: [] };
  }

  const body = payload as Record<string, unknown>;
  const data = body.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const pageData = data as Record<string, unknown>;
    const rows = Array.isArray(pageData.data) ? pageData.data : [];
    return {
      count: Number(pageData.count ?? rows.length),
      page: Number(pageData.page ?? page),
      limit: Number(pageData.limit ?? limit),
      data: rows.map((item) => normalizeDispute(item as Record<string, unknown>)),
    };
  }

  if (Array.isArray(data)) {
    return {
      count: data.length,
      page,
      limit,
      data: data.map((item) => normalizeDispute(item as Record<string, unknown>)),
    };
  }

  return { count: 0, page, limit, data: [] };
}
