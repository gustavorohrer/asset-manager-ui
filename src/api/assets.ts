import { getApiBaseUrl } from "@/api/config";
import {
  type ListAssetsResponse,
  listAssetsResponseSchema,
} from "@/domain/assets";

export async function fetchAssets(): Promise<ListAssetsResponse> {
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
  return listAssetsResponseSchema.parse(payload);
}
