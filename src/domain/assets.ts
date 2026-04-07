import { z } from "zod";

export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  lastScan: z.string().datetime().nullable(),
  hasVulnerabilities: z.boolean(),
  hasThreats: z.boolean(),
});

export const listAssetsResponseSchema = z.object({
  data: z.array(assetSchema),
});

export type Asset = z.infer<typeof assetSchema>;
