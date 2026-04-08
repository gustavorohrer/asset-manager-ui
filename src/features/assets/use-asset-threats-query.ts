"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getAssetThreats } from "@/api/assets";
import type { RiskLevel } from "@/domain/threats";

export function assetThreatsQueryKey(assetId: string, riskLevel?: RiskLevel) {
  return ["assets", assetId, "threats", { riskLevel }] as const;
}

export function useAssetThreatsQuery(assetId: string, riskLevel?: RiskLevel) {
  return useInfiniteQuery({
    queryKey: assetThreatsQueryKey(assetId, riskLevel),
    queryFn: ({ pageParam }) =>
      getAssetThreats(assetId, pageParam, 10, riskLevel),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(assetId),
  });
}
