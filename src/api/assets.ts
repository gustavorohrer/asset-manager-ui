import { getApiBaseUrl } from "@/api/config";
import type { Asset, AssetDetails } from "@/domain/assets";
import {
  assetDetailsResponseSchema,
  listAssetsResponseSchema,
} from "@/domain/assets";

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
