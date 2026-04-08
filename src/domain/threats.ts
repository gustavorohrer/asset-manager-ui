import { z } from "zod";

export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const assetThreatSchema = z.object({
  id: z.string(),
  description: z.string(),
  riskLevel: riskLevelSchema,
  type: z.string(),
  componentId: z.string(),
  componentName: z.string(),
  performedAt: z.string().datetime(),
});

export type AssetThreat = z.infer<typeof assetThreatSchema>;

export const listAssetThreatsResponseSchema = z.object({
  data: z.array(assetThreatSchema),
  pagination: paginationSchema,
});

export type ListAssetThreatsResponse = z.infer<
  typeof listAssetThreatsResponseSchema
>;
