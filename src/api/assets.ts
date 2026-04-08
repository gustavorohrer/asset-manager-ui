import { getApiBaseUrl } from "@/api/config";
import type {
  AssetDetails,
  AssetRiskSummary,
  AssetSortBy,
  AssetSortOrder,
  ListAssetsResponse,
} from "@/domain/assets";
import {
  assetDetailsResponseSchema,
  assetRiskSummarySchema,
  listAssetsResponseSchema,
} from "@/domain/assets";
import {
  type ListAssetThreatsResponse,
  listAssetThreatsResponseSchema,
  type RiskLevel,
} from "@/domain/threats";
import {
  type ListAssetVulnerabilitiesResponse,
  listAssetVulnerabilitiesResponseSchema,
  type VulnerabilitySeverity,
} from "@/domain/vulnerabilities";

export async function getAssets(
  page = 1,
  pageSize = 20,
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
  lastScanFrom?: string,
  lastScanTo?: string,
  hasVulnerabilities?: boolean,
  hasThreats?: boolean,
): Promise<ListAssetsResponse> {
  const url = new URL(`${getApiBaseUrl()}/assets`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  if (search) {
    url.searchParams.append("name", search);
  }

  if (sortBy) {
    url.searchParams.append("sortBy", sortBy);
  }

  if (sortOrder) {
    url.searchParams.append("sortOrder", sortOrder);
  }

  if (lastScanFrom) {
    url.searchParams.append("last_scan_from", lastScanFrom);
  }

  if (lastScanTo) {
    url.searchParams.append("last_scan_to", lastScanTo);
  }

  if (hasVulnerabilities !== undefined) {
    url.searchParams.append(
      "has_vulnerabilities",
      hasVulnerabilities.toString(),
    );
  }

  if (hasThreats !== undefined) {
    url.searchParams.append("has_threats", hasThreats.toString());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }

  const payload: unknown = await response.json();
  return listAssetsResponseSchema.parse(payload);
}

export async function getAssetsSummary(): Promise<AssetRiskSummary> {
  const response = await fetch(`${getApiBaseUrl()}/assets/summary`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch asset summary: ${response.status}`);
  }

  const payload: unknown = await response.json();
  return assetRiskSummarySchema.parse(payload);
}

export async function getAsset(id: string): Promise<AssetDetails> {
  const response = await fetch(`${getApiBaseUrl()}/assets/${id}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch asset ${id}: ${response.status}`);
  }

  const payload: unknown = await response.json();
  const parsedResponse = assetDetailsResponseSchema.parse(payload);

  return parsedResponse.data;
}

export async function getAssetVulnerabilities(
  assetId: string,
  page = 1,
  pageSize = 10,
  severity?: VulnerabilitySeverity,
): Promise<ListAssetVulnerabilitiesResponse> {
  const url = new URL(`${getApiBaseUrl()}/assets/${assetId}/vulnerabilities`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  if (severity) {
    url.searchParams.append("severity", severity);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vulnerabilities for asset ${assetId}: ${response.status}`,
    );
  }

  const payload: unknown = await response.json();
  return listAssetVulnerabilitiesResponseSchema.parse(payload);
}

export async function getAssetThreats(
  assetId: string,
  page = 1,
  pageSize = 10,
  riskLevel?: RiskLevel,
): Promise<ListAssetThreatsResponse> {
  const url = new URL(`${getApiBaseUrl()}/assets/${assetId}/threats`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  if (riskLevel) {
    url.searchParams.append("riskLevel", riskLevel);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch threats for asset ${assetId}: ${response.status}`,
    );
  }

  const payload: unknown = await response.json();
  return listAssetThreatsResponseSchema.parse(payload);
}
