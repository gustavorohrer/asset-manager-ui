"use client";

import { useQuery } from "@tanstack/react-query";

import { getAsset } from "@/api/assets";

export function assetQueryKey(id: string) {
  return ["assets", id] as const;
}

export function useAssetQuery(id: string) {
  return useQuery({
    queryKey: assetQueryKey(id),
    queryFn: () => getAsset(id),
    enabled: Boolean(id),
  });
}
