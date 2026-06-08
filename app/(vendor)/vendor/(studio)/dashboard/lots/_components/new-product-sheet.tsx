"use client";

import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Info, ShoppingBag, X } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { showToast } from "@/components/templates/toast-template";
import { Button } from "@/components/ui/button";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useCreateVendorLot } from "../_logics/useCreateVendorLot";
import { usePublicCategories } from "../_logics/usePublicCategories";
import { useUploadVendorLotImages } from "../_logics/useUploadVendorLotImages";
import { getCreatedLotId, type CreateVendorLotPayload } from "../_logics/vendor-lots";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.coerce.number().int().positive("Please select a category"),
  condition: z.enum(["new", "like_new", "used", "refurbished"], { error: "Condition is required" }),
  startingBid: z.coerce.number().positive("Must be greater than 0"),
  bidIncrement: z.coerce.number().positive("Must be greater than 0"),
  reservePrice: z.coerce.number().positive("Must be greater than 0"),
  buyNowPrice: z.coerce.number().positive("Must be greater than 0"),
  sku: z.string().min(1, "SKU is required"),
  pickupAvailable: z.boolean(),
  shippingAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type NewProductSheetProps = {
  onSuccess?: () => void;
};

export function NewProductSheet({ onSuccess }: NewProductSheetProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "creating" | "uploading">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createLot } = useCreateVendorLot();
  const { uploadLotImages } = useUploadVendorLotImages();
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = usePublicCategories(open);
  const isSubmitting = submitPhase !== "idle";

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview));
  }, [images]);

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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      pickupAvailable: false,
      shippingAvailable: false,
    },
  });

  async function onSubmit(values: FormValues) {
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
      reset();
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create lot. Please try again.";
      showToast("failure", message);
    } finally {
      setSubmitPhase("idle");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <ShoppingBag />
          New Product
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="shrink-0 px-6 py-4">
          <SheetTitle>New Product / Lot</SheetTitle>
          <SheetDescription>Fill in the details below to list a new product for auction.</SheetDescription>
        </SheetHeader>

        <TooltipProvider>
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
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
                <Select onValueChange={(v) => setValue("condition", v as FormValues["condition"], { shouldValidate: true })}>
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
              </Field>

              <Field label="Starting Bid (GHS)" hint="The opening bid amount for this lot." error={errors.startingBid?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" placeholder="50" {...register("startingBid")} />
              </Field>

              <Field label="Bid Increment (GHS)" hint="The minimum amount each new bid must increase by." error={errors.bidIncrement?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" placeholder="5" {...register("bidIncrement")} />
              </Field>

              <Field label="Reserve Price (GHS)" hint="The minimum price you're willing to accept. The item won't sell unless bidding reaches this amount." error={errors.reservePrice?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" placeholder="200" {...register("reservePrice")} />
              </Field>

              <Field label="Buy Now Price (GHS)" hint="Buyers can instantly purchase the item at this price, ending the auction immediately." error={errors.buyNowPrice?.message}>
                <Input className="h-11" type="number" min={0} step="0.01" placeholder="500" {...register("buyNowPrice")} />
              </Field>

              <Field label="SKU" hint="Your internal stock-keeping unit code for this product." error={errors.sku?.message}>
                <Input className="h-11" placeholder="SKU-001" {...register("sku")} />
              </Field>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <Label>Images</Label>
                  <FieldTooltip hint="Upload photos or videos to showcase your product." />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input py-8 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <ImageIcon className="size-7" />
                  <span className="text-sm">Click to upload images or videos</span>
                  <span className="text-xs opacity-60">PNG, JPG, WEBP, MP4, etc.</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                        {img.file.type.startsWith("video/") ? (
                          <video src={img.preview} className="h-full w-full object-cover" muted />
                        ) : (
                          <img src={img.preview} alt="" className="h-full w-full object-cover" />
                        )}
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
                    <Label htmlFor="pickupAvailable">Pickup Available</Label>
                    <FieldTooltip hint="Allow buyers to collect the item in person." />
                  </div>
                  <Controller
                    name="pickupAvailable"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="pickupAvailable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-5 border-foreground/40"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="shippingAvailable">Shipping Available</Label>
                    <FieldTooltip hint="Offer delivery/shipping as a fulfilment option for buyers." />
                  </div>
                  <Controller
                    name="shippingAvailable"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="shippingAvailable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-5 border-foreground/40"
                      />
                    )}
                  />
                </div>
              </div>

            </div>

            <SheetFooter className="shrink-0 border-t px-6 py-4">
              <Button size="lg" type="button" variant="outline" className="h-11" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button size="lg" type="submit" className="h-11" disabled={isSubmitting}>
                {submitPhase === "creating"
                  ? "Creating..."
                  : submitPhase === "uploading"
                    ? "Uploading images..."
                    : "Create Product"}
              </Button>
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
