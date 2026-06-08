import { z } from "zod";

export const lotFormSchema = z.object({
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

export type LotFormValues = z.infer<typeof lotFormSchema>;

export type LotCondition = LotFormValues["condition"];
