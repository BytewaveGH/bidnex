import z from "zod";

export const opportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  bids: z.number(),
  activity: z.string(),
  currentBid: z.string(),
});

export const opportunitiesSchema = z.array(opportunitySchema);

export type OpportunityRow = z.infer<typeof opportunitySchema>;
