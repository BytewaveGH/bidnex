"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Paperclip,
  Plus,
  Send,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { showToast } from "@/components/templates/toast-template";
import { formatDisputeStatus, type Dispute, type DisputeMessage } from "../../_logics/disputes";
import { useDispute } from "../../_logics/useDispute";
import { useAddDisputeMessage } from "../../_logics/useAddDisputeMessage";
import { useLotTitle } from "../../_logics/useLotTitle";
import { disputeStatusBadge, isDisputeResolved } from "./dispute-utils";

function ChatBubble({
  message,
  dispute,
  currentUserId,
}: {
  message: DisputeMessage;
  dispute: Dispute;
  currentUserId: number;
}) {
  const isOwn = message.senderId === currentUserId;
  const attachments = message.attachments ?? [];

  return (
    <div className={`flex flex-col gap-1 max-w-[85%] ${isOwn ? "ml-auto items-end" : "items-start"}`}>
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isOwn
            ? "bg-[#344054] text-white rounded-br-md"
            : "bg-white border border-[#F0F2F5] text-[#344054] rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.message}</p>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {attachments.map((url, i) => (
              <a
                key={`${url}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-xs underline ${isOwn ? "text-white/80" : "text-[#657688]"}`}
              >
                <Paperclip className="size-3" />
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] text-[#98A2B3] px-1">
        {format(parseISO(message.createdAt), "d MMM yyyy, h:mm a")}
      </span>
    </div>
  );
}

type DisputeThreadProps = {
  disputeId: number;
  className?: string;
  embedded?: boolean;
  onMessageCount?: (count: number) => void;
};

export default function DisputeThread({
  disputeId,
  className = "",
  embedded = false,
  onMessageCount,
}: DisputeThreadProps) {
  const { data: session } = useSession();
  const currentUserId = Number((session?.user as { userId?: string | number })?.userId);
  const { data: dispute, isLoading, error, refetch, isSampleData, appendDemoMessage } = useDispute(disputeId);
  const { title: lotTitle, isLoading: lotTitleLoading } = useLotTitle(dispute?.lotId);
  const { addMessage, isLoading: isSending } = useAddDisputeMessage();

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([""]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isResolved = dispute ? isDisputeResolved(dispute.status) : false;
  const displayTitle = dispute?.lotTitle ?? lotTitle ?? (lotTitleLoading ? "Loading…" : "Disputed item");

  useEffect(() => {
    if (!dispute?.messages) return;
    onMessageCount?.(dispute.messages.length);
  }, [dispute?.messages, onMessageCount]);

  function updateAttachment(index: number, value: string) {
    setAttachments((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      showToast("failure", "Please enter a message.");
      return;
    }

    const validAttachments = attachments.map((url) => url.trim()).filter(Boolean);

    try {
      if (isSampleData) {
        appendDemoMessage({ message: trimmed, attachments: validAttachments });
      } else {
        await addMessage(disputeId, { message: trimmed, attachments: validAttachments });
        await refetch();
      }
      setMessage("");
      setAttachments([""]);
      setShowAttachments(false);
      showToast("success", "Your message has been sent.");
    } catch (err) {
      showToast("failure", err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col bg-[#F9FAFB] ${className}`}>
        <div className="h-32 animate-pulse bg-[#F0F2F5]" />
        <div className="h-14 border-t border-[#F0F2F5] animate-pulse" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className={`flex items-center justify-center bg-[#F9FAFB] p-8 ${className}`}>
        <p className="text-sm text-[#D42620]">{error ?? "Dispute not found."}</p>
      </div>
    );
  }

  const messages = dispute.messages ?? [];

  return (
    <div className={`flex flex-col bg-[#F9FAFB] min-h-0 ${className}`}>
      {!embedded && (
        <>
          <div className="shrink-0 px-5 py-4 border-b border-[#F0F2F5] bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#344054] text-white text-sm font-semibold">
                {displayTitle.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2A3239] truncate">{displayTitle}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#657688] truncate">{dispute.reason}</span>
                  {!isResolved && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 shrink-0">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            {dispute.lotId > 0 && (
              <Link
                href={`/bidder/product/${dispute.lotId}`}
                className="shrink-0 h-8 px-3 rounded-lg border border-[#E4E7EC] bg-white text-xs font-medium text-[#344054] hover:bg-white inline-flex items-center gap-1"
              >
                View item
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="shrink-0 px-5 py-2.5 border-b border-[#F0F2F5] bg-white flex items-center justify-between text-left hover:bg-white transition-colors"
          >
            <span className="text-xs text-[#657688]">
              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium mr-2 ${disputeStatusBadge(dispute.status)}`}>
                {formatDisputeStatus(dispute.status)}
              </span>
              Filed {format(parseISO(dispute.filedAt ?? dispute.createdAt), "d MMM yyyy")}
            </span>
            {showDetails ? <ChevronUp className="size-4 text-[#657688]" /> : <ChevronDown className="size-4 text-[#657688]" />}
          </button>

          {showDetails && (
            <div className="shrink-0 px-5 py-4 border-b border-[#F0F2F5] bg-white space-y-3">
              {dispute.description && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-1">Your report</p>
                  <p className="text-sm text-[#344054] leading-relaxed">{dispute.description}</p>
                </div>
              )}
              {dispute.outcomeNote && (
                <div className="rounded-lg bg-[#F9FAFB] border border-[#F0F2F5] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-1">Outcome</p>
                  <p className="text-sm text-[#344054]">{dispute.outcomeNote}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {embedded && dispute.outcomeNote && (
        <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-[#F0F2F5] bg-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-1">Outcome</p>
          <p className="text-sm text-[#344054]">{dispute.outcomeNote}</p>
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3 ${
          embedded ? "max-h-[360px] min-h-[200px]" : "min-h-[240px]"
        }`}
      >
        {dispute.description && messages.length === 0 && (
          <ChatBubble
            message={{
              id: 0,
              disputeId: dispute.id,
              senderId: dispute.buyerId ?? currentUserId,
              message: dispute.description,
              createdAt: dispute.filedAt ?? dispute.createdAt,
            }}
            dispute={dispute}
            currentUserId={currentUserId}
          />
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} dispute={dispute} currentUserId={currentUserId} />
        ))}
        {messages.length === 0 && !dispute.description && (
          <p className="text-sm text-[#657688] text-center py-8">
            No messages yet. Send a message below to reach support.
          </p>
        )}
      </div>

      {!isResolved ? (
        <form onSubmit={handleSend} className="shrink-0 border-t border-[#F0F2F5] bg-white p-4">
          {showAttachments && (
            <div className="mb-3 space-y-2">
              {attachments.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateAttachment(index, e.target.value)}
                    placeholder="https://..."
                    disabled={isSending}
                    className="h-9 text-sm bg-[#F9FAFB]"
                  />
                  {attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAttachments((p) => p.filter((_, i) => i !== index))}
                      className="size-8 flex items-center justify-center rounded-lg border border-[#E4E7EC] text-[#657688]"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAttachments((p) => [...p, ""])}
                className="text-xs text-[#657688] hover:text-[#344054] inline-flex items-center gap-1"
              >
                <Plus className="size-3.5" /> Add link
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAttachments((v) => !v)}
              className="shrink-0 size-10 flex items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-[#657688] hover:bg-white"
            >
              <Paperclip className="size-4" />
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to support"
              disabled={isSending}
              className="flex-1 h-11 px-4 rounded-xl border border-[#E4E7EC] bg-white text-sm text-[#344054] placeholder:text-[#98A2B3] outline-none focus:border-[#344054] focus:ring-1 focus:ring-[#344054]/20"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="shrink-0 size-11 flex items-center justify-center rounded-xl bg-[#344054] text-white hover:bg-[#1D2939] disabled:opacity-40 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="shrink-0 border-t border-[#F0F2F5] bg-white px-4 sm:px-5 py-3.5 text-center">
          <p className="text-xs text-[#657688]">This dispute is resolved. Messaging is closed.</p>
        </div>
      )}
    </div>
  );
}
