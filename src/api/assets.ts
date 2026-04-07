import { getApiBaseUrl } from "@/api/config";
import type { Asset } from "@/domain/assets";
import { listAssetsResponseSchema } from "@/domain/assets";

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
