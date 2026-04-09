import { z } from "zod";
import { paginationSchema } from "./vulnerabilities";

const assetBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  lastScan: z.string().datetime().nullable(),
  hasVulnerabilities: z.boolean(),
  hasThreats: z.boolean(),
});

export const vulnerabilityCountsSchema = z.object({
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const threatCountsSchema = z.object({
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const assetSchema = assetBaseSchema.extend({
  vulnerabilityCounts: vulnerabilityCountsSchema.optional().default({
    high: 0,
    medium: 0,
    total: 0,
  }),
  threatCounts: threatCountsSchema.optional().default({
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  }),
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

export const assetDetailsSchema = assetBaseSchema.extend({
  components: z.array(assetComponentSchema),
});

export const listAssetsResponseSchema = z.object({
  data: z.array(assetSchema),
  pagination: paginationSchema,
});

export const assetRiskSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  withVulnerabilities: z.number().int().nonnegative(),
  withThreats: z.number().int().nonnegative(),
});

export const assetDetailsResponseSchema = z.object({
  data: assetDetailsSchema,
});

export type Asset = z.infer<typeof assetSchema>;
export type VulnerabilityCounts = z.infer<typeof vulnerabilityCountsSchema>;
export type ThreatCounts = z.infer<typeof threatCountsSchema>;
export type AssetComponent = z.infer<typeof assetComponentSchema>;
export type AssetDetails = z.infer<typeof assetDetailsSchema>;
export type ListAssetsResponse = z.infer<typeof listAssetsResponseSchema>;
export type AssetRiskSummary = z.infer<typeof assetRiskSummarySchema>;

export const assetSortBySchema = z.enum(["createdAt", "name", "lastScan"]);
export const assetSortOrderSchema = z.enum(["asc", "desc"]);

export type AssetSortBy = z.infer<typeof assetSortBySchema>;
export type AssetSortOrder = z.infer<typeof assetSortOrderSchema>;
