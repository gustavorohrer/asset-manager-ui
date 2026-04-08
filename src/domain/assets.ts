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

export const assetComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  vendor: z.string(),
  type: z.string(),
  createdAt: z.string().datetime(),
  lastScan: z.string().datetime().nullable(),
  assetId: z.string(),
});

export const assetDetailsSchema = assetSchema.extend({
  components: z.array(assetComponentSchema),
});

export const listAssetsResponseSchema = z.object({
  data: z.array(assetSchema),
});

export const assetDetailsResponseSchema = z.object({
  data: assetDetailsSchema,
});

export type Asset = z.infer<typeof assetSchema>;
export type AssetComponent = z.infer<typeof assetComponentSchema>;
export type AssetDetails = z.infer<typeof assetDetailsSchema>;
