import { z } from "zod";

export const vulnerabilitySeveritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export type VulnerabilitySeverity = z.infer<typeof vulnerabilitySeveritySchema>;

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const assetVulnerabilitySchema = z.object({
  id: z.string(),
  description: z.string(),
  severity: vulnerabilitySeveritySchema,
  componentId: z.string(),
  componentName: z.string(),
  performedAt: z.string().datetime(),
});

export type AssetVulnerability = z.infer<typeof assetVulnerabilitySchema>;

export const listAssetVulnerabilitiesResponseSchema = z.object({
  data: z.array(assetVulnerabilitySchema),
  pagination: paginationSchema,
});

export type ListAssetVulnerabilitiesResponse = z.infer<
  typeof listAssetVulnerabilitiesResponseSchema
>;
