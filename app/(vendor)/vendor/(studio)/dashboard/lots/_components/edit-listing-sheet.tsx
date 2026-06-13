"use client";

import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Info, Plus, X } from "lucide-react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";

import { showToast } from "@/components/templates/toast-template";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { usePublicCategories } from "../_logics/usePublicCategories";
import { useUpdateVendorLot } from "../_logics/useUpdateVendorLot";
import { useUploadVendorLotImages } from "../_logics/useUploadVendorLotImages";
import type { CreateVendorLotPayload } from "../_logics/vendor-lots";
import { lotFormSchema, type LotFormValues } from "./lot-form-schema";
import type { LotRow } from "./recent-orders-table/schema";

type EditListingSheetProps = {
  lot: LotRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

function lotToFormValues(lot: LotRow): LotFormValues {
  const specifications = lot.specifications
    ? Object.entries(lot.specifications).map(([key, value]) => ({ key, value: String(value) }))
    : [];
  return {
    title: lot.title,
    description: lot.description,
    categoryId: lot.categoryId ?? 0,
    condition: lot.conditionRaw,
    startingBid: lot.startingBidAmount,
    bidIncrement: lot.bidIncrementAmount,
    reservePrice: lot.reservePriceAmount,
    buyNowPrice: lot.buyNowPriceAmount,
    sku: lot.sku,
    pickupAvailable: lot.pickupAvailable,
    shippingAvailable: lot.shippingAvailable,
    specifications,
  };
}

export function EditListingSheet({ lot, open, onOpenChange, onSuccess }: EditListingSheetProps) {
  const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string; mediaType: "image" | "video" }>>([]);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "saving" | "uploading">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateLot } = useUpdateVendorLot();
  const { uploadLotImages } = useUploadVendorLotImages();
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = usePublicCategories(open);
  const canSave = lot?.reviewStatus === "draft";
  const isSubmitting = submitPhase !== "idle";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<LotFormValues>({
    resolver: zodResolver(lotFormSchema) as Resolver<LotFormValues>,
    defaultValues: {
      pickupAvailable: false,
      shippingAvailable: false,
      specifications: [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications",
  });

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview));
  }, [images]);

  useEffect(() => {
    if (open && lot) {
      reset(lotToFormValues(lot));
      setExistingImages(lot.images);
      setImages([]);
    }
  }, [open, lot, reset]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(values: LotFormValues) {
    if (!lot || !canSave) return;

    const specifications = values.specifications
      .filter(s => s.key.trim())
      .reduce<Record<string, unknown>>((acc, { key, value }) => {
        acc[key.trim()] = value.trim();
        return acc;
      }, {});

    const payload: CreateVendorLotPayload = {
      title: values.title,
      description: values.description,
      condition: values.condition,
      startingBid: values.startingBid,
      bidIncrement: values.bidIncrement,
      reservePrice: values.reservePrice,
      buyNowPrice: values.buyNowPrice,
      categoryId: values.categoryId,
      sku: values.sku,
      pickupAvailable: values.pickupAvailable,
      shippingAvailable: values.shippingAvailable,
      ...(Object.keys(specifications).length > 0 && { specifications }),
    };

    setSubmitPhase("saving");

    try {
      await updateLot(lot.id, payload);

      if (images.length > 0) {
        setSubmitPhase("uploading");
        await uploadLotImages(lot.id, images.map((img) => img.file));
      }

      showToast("success", "Lot updated successfully.");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update lot. Please try again.";
      showToast("failure", message);
    } finally {
      setSubmitPhase("idle");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="shrink-0 px-6 py-4">
          <SheetTitle>{canSave ? "Edit Listing" : "View Listing"}</SheetTitle>
          <SheetDescription>
            {canSave
              ? "Update the details for this lot listing."
              : "This listing is read-only because only draft lots can be edited."}
          </SheetDescription>
        </SheetHeader>

        <TooltipProvider>
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <fieldset disabled={!canSave} className="flex min-h-0 flex-1 flex-col border-0 p-0 m-0">
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
              <Field label="Title" hint="The display name of your product as it will appear in the auction listing." error={errors.title?.message}>
                <Input className="h-11" placeholder="e.g. iPhone 14 Pro — 256GB Midnight" {...register("title")} />
              </Field>

              <Field label="Description" hint="Provide detailed information about the item." error={errors.description?.message}>
                <Textarea placeholder="Describe the product..." rows={4} {...register("description")} />
              </Field>

              <Field label="Category" hint="Select the category that best fits your product." error={errors.categoryId?.message ?? categoriesError ?? undefined}>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isCategoriesLoading || categories.length === 0}
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger size="lg" className="w-full">
                        <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Condition" hint="The physical state of the item." error={errors.condition?.message}>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="lg" className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Starting Bid (GHS)" error={errors.startingBid?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" {...register("startingBid")} />
              </Field>

              <Field label="Bid Increment (GHS)" error={errors.bidIncrement?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" {...register("bidIncrement")} />
              </Field>

              <Field label="Reserve Price (GHS)" error={errors.reservePrice?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" {...register("reservePrice")} />
              </Field>

              <Field label="Buy Now Price (GHS)" error={errors.buyNowPrice?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" {...register("buyNowPrice")} />
              </Field>

              <Field label="SKU" error={errors.sku?.message}>
                <Input className="h-11" placeholder="SKU-001" {...register("sku")} />
              </Field>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <Label>Specifications</Label>
                  <FieldTooltip hint="Key/value pairs describing product specs (e.g. Storage: 256GB)." />
                </div>
                {specFields.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {specFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          className="h-9 flex-1"
                          placeholder="Key (e.g. Storage)"
                          {...register(`specifications.${index}.key`)}
                        />
                        <Input
                          className="h-9 flex-1"
                          placeholder="Value (e.g. 256GB)"
                          {...register(`specifications.${index}.value`)}
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => appendSpec({ key: "", value: "" })}
                >
                  <Plus className="size-4" />
                  Add Specification
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <Label>Images</Label>
                  <FieldTooltip hint="Optional. Upload photos to showcase your product." />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input py-8 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <ImageIcon className="size-7" />
                  <span className="text-sm">Click to upload images</span>
                  <span className="text-xs opacity-60">Optional — PNG, JPG, WEBP</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {(existingImages.length > 0 || images.length > 0) && (
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border">
                        {img.mediaType === "video" ? (
                          <video src={img.url} className="h-full w-full object-cover" muted />
                        ) : (
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    ))}
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                        <img src={img.preview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white transition-colors hover:bg-black/70"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-pickupAvailable">Pickup Available</Label>
                    <FieldTooltip hint="Allow buyers to collect the item in person." />
                  </div>
                  <Controller
                    name="pickupAvailable"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="edit-pickupAvailable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-5 border-foreground/40"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-shippingAvailable">Shipping Available</Label>
                    <FieldTooltip hint="Offer delivery/shipping as a fulfilment option for buyers." />
                  </div>
                  <Controller
                    name="shippingAvailable"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="edit-shippingAvailable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-5 border-foreground/40"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            </fieldset>

            <SheetFooter className="shrink-0 border-t px-6 py-4">
              <Button size="lg" type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Close
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex w-full">
                    <Button size="lg" type="submit" className="h-11 w-full" disabled={isSubmitting || !lot || !canSave}>
                      {submitPhase === "saving" ? "Saving..." : submitPhase === "uploading" ? "Uploading images..." : "Save Changes"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canSave ? (
                  <TooltipContent>Only draft lots can be edited</TooltipContent>
                ) : null}
              </Tooltip>
            </SheetFooter>
          </form>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}

function FieldTooltip({ hint }: { hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5 cursor-default text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent side="right">{hint}</TooltipContent>
    </Tooltip>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {hint && <FieldTooltip hint={hint} />}
      </div>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
