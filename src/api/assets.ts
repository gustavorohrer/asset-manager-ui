import { getApiBaseUrl } from "@/api/config";
import type { Asset, AssetDetails } from "@/domain/assets";
import {
  assetDetailsResponseSchema,
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

export async function getAssets(): Promise<Asset[]> {
  const response = await fetch(`${getApiBaseUrl()}/assets`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }

  const payload: unknown = await response.json();
  const parsedResponse = listAssetsResponseSchema.parse(payload);

  return parsedResponse.data;
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
