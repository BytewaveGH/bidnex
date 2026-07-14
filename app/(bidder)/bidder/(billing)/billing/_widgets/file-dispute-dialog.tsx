"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/templates/toast-template";
import { useCreateDispute } from "../../_logics/useCreateDispute";

type FileDisputeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotId: number | null;
  lotTitle?: string;
  onSuccess?: () => void;
};

export default function FileDisputeDialog({
  open,
  onOpenChange,
  lotId,
  lotTitle,
  onSuccess,
}: FileDisputeDialogProps) {
  const { createDispute, isLoading } = useCreateDispute();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setReason("");
    setDescription("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotId) return;

    const trimmedReason = reason.trim();
    const trimmedDescription = description.trim();

    if (!trimmedReason) {
      showToast("failure", "Please enter a reason for the dispute.");
      return;
    }

    if (!trimmedDescription) {
      showToast("failure", "Please describe the issue in detail.");
      return;
    }

    try {
      await createDispute({
        lotId,
        reason: trimmedReason,
        description: trimmedDescription,
      });
      showToast("success", "Your dispute has been filed.", "Dispute Submitted");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to file dispute.";
      showToast("failure", message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>File a Dispute</DialogTitle>
            <DialogDescription>
              {lotTitle
                ? `Report an issue with "${lotTitle}". Our team will review your case.`
                : "Report an issue with your order. Our team will review your case."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dispute-reason" className="text-sm font-medium text-[#344054]">
                Reason
              </label>
              <Input
                id="dispute-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Item not as described"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dispute-description" className="text-sm font-medium text-[#344054]">
                Description
              </label>
              <Textarea
                id="dispute-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={5}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="h-9 px-4 rounded-lg border border-[#E4E7EC] text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !lotId}
              className="h-9 px-4 rounded-lg bg-[#344054] text-white text-sm font-medium hover:bg-[#1D2939] disabled:opacity-50"
            >
              {isLoading ? "Submitting…" : "Submit Dispute"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
