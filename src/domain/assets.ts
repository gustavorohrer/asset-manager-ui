import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const assetSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  lastScan: z.string().datetime().nullable(),
  hasVulnerabilities: z.boolean(),
  hasThreats: z.boolean(),
});

export const listAssetsResponseSchema = z.object({
  data: z.array(assetSummarySchema),
  pagination: paginationSchema,
});

export type AssetSummary = z.infer<typeof assetSummarySchema>;
export type ListAssetsResponse = z.infer<typeof listAssetsResponseSchema>;
