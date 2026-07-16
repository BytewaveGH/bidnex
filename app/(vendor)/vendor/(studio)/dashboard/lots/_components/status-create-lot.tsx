"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, ChevronUp, ImagePlus, Plus, Sparkles, X } from "lucide-react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { showToast } from "@/components/templates/toast-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { useCreateVendorLot } from "../_logics/useCreateVendorLot";
import { usePublicCategories } from "../_logics/usePublicCategories";
import { useUploadVendorLotImages } from "../_logics/useUploadVendorLotImages";
import { getCreatedLotId, type CreateVendorLotPayload } from "../_logics/vendor-lots";
import { lotFormSchema, type LotFormValues } from "./lot-form-schema";
import { Field, FieldTooltip } from "./new-product-sheet";

type StatusCreateLotProps = {
  onSuccess?: () => void;
};

type MediaItem = { file: File; preview: string };

export function StatusCreateLot({ onSuccess }: StatusCreateLotProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "creating" | "uploading">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createLot } = useCreateVendorLot();
  const { uploadLotImages } = useUploadVendorLotImages();
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = usePublicCategories(open);
  const isSubmitting = submitPhase !== "idle";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const titleValue = watch("title");

  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview));
  }, []);

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(Math.max(0, images.length - 1));
  }, [images.length, activeIndex]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClose() {
    if (isSubmitting) return;
    setOpen(false);
    resetAll();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !detailsOpen) handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, detailsOpen]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
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

  function resetAll() {
    reset();
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setActiveIndex(0);
    setDetailsOpen(false);
  }

  async function onSubmit(values: LotFormValues) {
    const specifications = values.specifications
      .filter((s) => s.key.trim())
      .reduce<Record<string, unknown>>((acc, { key, value }) => {
        acc[key.trim()] = value.trim();
        return acc;
      }, {});

    const payload: CreateVendorLotPayload = {
      title: values.title,
      description: values.description,
      condition: values.condition,
      ...(values.reservePrice !== undefined && { reservePrice: values.reservePrice }),
      ...(values.buyNowPrice !== undefined && { buyNowPrice: values.buyNowPrice }),
      categoryId: values.categoryId,
      pickupAvailable: values.pickupAvailable,
      shippingAvailable: values.shippingAvailable,
      ...(Object.keys(specifications).length > 0 && { specifications }),
    };

    setSubmitPhase("creating");

    try {
      const result = await createLot(payload);
      const lotId = getCreatedLotId(result);

      if (!lotId) {
        throw new Error("Lot created but no ID was returned.");
      }

      if (images.length > 0) {
        setSubmitPhase("uploading");
        await uploadLotImages(
          lotId,
          images.map((img) => img.file),
        );
      }

      showToast("success", "Lot created successfully.");
      setOpen(false);
      resetAll();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create lot. Please try again.";
      showToast("failure", message);
    } finally {
      setSubmitPhase("idle");
    }
  }

  const current = images[activeIndex];

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Sparkles />
        Quick Create
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-40 flex flex-col bg-black">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
              {images.length > 1 && (
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 w-6 rounded-full transition-colors ${i === activeIndex ? "bg-white" : "bg-white/25"}`}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
              >
                <ImagePlus className="size-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
              {!current ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <span className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-white/40">
                    <ImagePlus className="size-8" />
                  </span>
                  <span className="text-sm">Tap to add photos or videos</span>
                </button>
              ) : (
                <>
                  {current.file.type.startsWith("video/") ? (
                    <video src={current.preview} className="max-h-full max-w-full object-contain" muted controls />
                  ) : (
                    <img src={current.preview} alt="" className="max-h-full max-w-full object-contain" />
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(activeIndex)}
                    className="absolute right-3 top-16 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-destructive/80"
                  >
                    <X className="size-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="z-20 flex gap-2 overflow-x-auto px-4 pb-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${i === activeIndex ? "border-white" : "border-transparent"}`}
                  >
                    {img.file.type.startsWith("video/") ? (
                      <video src={img.preview} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-14 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-white/40 text-white/60 transition-colors hover:text-white"
                >
                  <Plus className="size-5" />
                </button>
              </div>
            )}

            {/* Caption bar -> opens details drawer */}
            {images.length > 0 && (
              <div className="z-20 flex items-center gap-2 border-t border-white/10 bg-black/80 p-3">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="flex flex-1 items-center rounded-full bg-white/10 px-4 py-3 text-left transition-colors hover:bg-white/15"
                >
                  <span className="truncate text-sm text-white/80">
                    {titleValue || "Add title, price & details..."}
                  </span>
                </button>
                <Button size="icon-lg" className="rounded-full" onClick={() => setDetailsOpen(true)} disabled={isSubmitting}>
                  <ChevronUp className="size-5" />
                </Button>
              </div>
            )}
          </div>,
          document.body,
        )}

      <Drawer direction="bottom" open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DrawerContent>
          <TooltipProvider>
            <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 px-6 pb-2">
                <h2 className="font-heading text-base font-medium">Finish your listing</h2>
                <p className="text-muted-foreground text-sm">Add the details buyers will see alongside your photos.</p>
              </div>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
                <Field label="Title" hint="The display name of your product as it will appear in the auction listing." error={errors.title?.message}>
                  <Input className="h-11" placeholder="e.g. iPhone 14 Pro — 256GB Midnight" {...register("title")} />
                </Field>

                <Field label="Description" hint="Provide detailed information about the item — condition, history, dimensions, or any relevant notes for buyers." error={errors.description?.message}>
                  <Textarea placeholder="Describe the product..." rows={4} {...register("description")} />
                </Field>

                <Field label="Category" hint="Select the category that best fits your product. This helps buyers find your listing." error={errors.categoryId?.message ?? categoriesError ?? undefined}>
                  <Select
                    disabled={isCategoriesLoading || categories.length === 0}
                    onValueChange={(v) => setValue("categoryId", Number(v), { shouldValidate: true })}
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
                </Field>

                <Field label="Condition" hint="The physical state of the item. Choose the option that best describes its current condition." error={errors.condition?.message}>
                  <Select onValueChange={(v) => setValue("condition", v as LotFormValues["condition"], { shouldValidate: true })}>
                    <SelectTrigger size="lg" className="w-full">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good_condition">Good Condition</SelectItem>
                      <SelectItem value="as_is">As Is</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Reserve Price (GHS)" hint="The minimum price you're willing to accept. The item won't sell unless bidding reaches this amount." error={errors.reservePrice?.message}>
                  <Input className="h-11" type="number" min={0} step="0.01" placeholder="200" {...register("reservePrice")} />
                </Field>

                <Field label="Buy Now Price (GHS)" hint="Buyers can instantly purchase the item at this price, ending the auction immediately." error={errors.buyNowPrice?.message}>
                  <Input className="h-11" type="number" min={0} step="0.01" placeholder="500" {...register("buyNowPrice")} />
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
                          <Input className="h-9 flex-1" placeholder="Key (e.g. Storage)" {...register(`specifications.${index}.key`)} />
                          <Input className="h-9 flex-1" placeholder="Value (e.g. 256GB)" {...register(`specifications.${index}.value`)} />
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

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="quick-pickupAvailable">Pickup Available</Label>
                      <FieldTooltip hint="Allow buyers to collect the item in person." />
                    </div>
                    <Controller
                      name="pickupAvailable"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="quick-pickupAvailable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="size-5 border-foreground/40"
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="quick-shippingAvailable">Delivery Available</Label>
                      <FieldTooltip hint="Offer delivery as a fulfilment option for buyers." />
                    </div>
                    <Controller
                      name="shippingAvailable"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="quick-shippingAvailable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="size-5 border-foreground/40"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t px-6 py-4">
                <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setDetailsOpen(false)}>
                  Back to preview
                </Button>
                <Button type="submit" className="h-11 flex-1" disabled={isSubmitting}>
                  {submitPhase === "creating"
                    ? "Creating..."
                    : submitPhase === "uploading"
                      ? "Uploading images..."
                      : "Post Product"}
                </Button>
              </div>
            </form>
          </TooltipProvider>
        </DrawerContent>
      </Drawer>
    </>
  );
}
