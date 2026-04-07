"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAssets } from "@/api/assets";

export const assetsQueryKey = ["assets"] as const;

export function useAssetsQuery() {
  return useQuery({
    queryKey: assetsQueryKey,
    queryFn: fetchAssets,
  });
}
