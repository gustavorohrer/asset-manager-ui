"use client";

import { useQuery } from "@tanstack/react-query";

import { getAssetsSummary } from "@/api/assets";

export function assetsSummaryQueryKey() {
  return ["assets", "summary"] as const;
}

export function useAssetsSummaryQuery() {
  return useQuery({
    queryKey: assetsSummaryQueryKey(),
    queryFn: getAssetsSummary,
  });
}
