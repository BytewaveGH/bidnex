"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { Paperclip, Plus, Send, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { showToast } from "@/components/templates/toast-template";
import { type Dispute, type DisputeMessage } from "@/app/(bidder)/bidder/(billing)/_logics/disputes";
import { useVendorAddDisputeMessage } from "../_logics/useVendorAddDisputeMessage";
import { useVendorDispute } from "../_logics/useVendorDispute";
import { getSenderLabel, isDisputeResolved } from "./dispute-utils";

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
  const sender = getSenderLabel(message, dispute, currentUserId);

  return (
    <div className={`flex flex-col gap-1 max-w-[85%] ${isOwn ? "ml-auto items-end" : "items-start"}`}>
      {!isOwn && (
        <span className="text-[10px] font-medium text-muted-foreground px-1">{sender}</span>
      )}
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-background border text-foreground rounded-bl-md"
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
                className={`inline-flex items-center gap-1 text-xs underline ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}
              >
                <Paperclip className="size-3" />
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground px-1">
        {format(parseISO(message.createdAt), "d MMM yyyy, h:mm a")}
      </span>
    </div>
  );
}

type VendorDisputeThreadProps = {
  disputeId: number;
  onMessageCount?: (count: number) => void;
};

export function VendorDisputeThread({ disputeId, onMessageCount }: VendorDisputeThreadProps) {
  const { data: session } = useSession();
  const currentUserId = Number((session?.user as { userId?: string | number })?.userId);
  const { data: dispute, isLoading, error, refetch, isSampleData, appendDemoMessage } =
    useVendorDispute(disputeId);
  const { addMessage, isLoading: isSending } = useVendorAddDisputeMessage();

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([""]);
  const [showAttachments, setShowAttachments] = useState(false);

  const isResolved = dispute ? isDisputeResolved(dispute.status) : false;

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
      <div className="bg-muted/30 p-6">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex items-center justify-center bg-muted/30 p-8">
        <p className="text-sm text-destructive">{error ?? "Dispute not found."}</p>
      </div>
    );
  }

  const messages = dispute.messages ?? [];

  return (
    <div className="flex flex-col bg-muted/30">
      {dispute.description && (
        <div className="border-b bg-background px-4 sm:px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Buyer report
          </p>
          <p className="text-sm leading-relaxed">{dispute.description}</p>
        </div>
      )}

      {dispute.outcomeNote && (
        <div className="border-b bg-background px-4 sm:px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Outcome
          </p>
          <p className="text-sm leading-relaxed">{dispute.outcomeNote}</p>
        </div>
      )}

      <div className="max-h-[360px] min-h-[200px] overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} dispute={dispute} currentUserId={currentUserId} />
        ))}
        {messages.length === 0 && !dispute.description && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Reply to the buyer below.
          </p>
        )}
      </div>

      {!isResolved ? (
        <form onSubmit={handleSend} className="border-t bg-background p-4">
          {showAttachments && (
            <div className="mb-3 space-y-2">
              {attachments.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateAttachment(index, e.target.value)}
                    placeholder="https://..."
                    disabled={isSending}
                    className="h-9 text-sm"
                  />
                  {attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAttachments((p) => p.filter((_, i) => i !== index))}
                      className="size-8 flex items-center justify-center rounded-lg border text-muted-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAttachments((p) => [...p, ""])}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <Plus className="size-3.5" /> Add link
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAttachments((v) => !v)}
              className="shrink-0 size-10 flex items-center justify-center rounded-xl border bg-background text-muted-foreground hover:bg-background"
            >
              <Paperclip className="size-4" />
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a reply to the buyer"
              disabled={isSending}
              className="flex-1 h-11 px-4 rounded-xl border bg-background text-sm outline-none focus:border-ring"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="shrink-0 size-11 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary disabled:opacity-40 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t bg-background px-4 sm:px-5 py-3.5 text-center">
          <p className="text-xs text-muted-foreground">This dispute is resolved. Messaging is closed.</p>
        </div>
      )}
    </div>
  );
}
