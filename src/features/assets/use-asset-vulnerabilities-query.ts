"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getAssetVulnerabilities } from "@/api/assets";
import type { VulnerabilitySeverity } from "@/domain/vulnerabilities";

export function assetVulnerabilitiesQueryKey(
  assetId: string,
  severity?: VulnerabilitySeverity,
) {
  return ["assets", assetId, "vulnerabilities", { severity }] as const;
}

export function useAssetVulnerabilitiesQuery(
  assetId: string,
  severity?: VulnerabilitySeverity,
) {
  return useInfiniteQuery({
    queryKey: assetVulnerabilitiesQueryKey(assetId, severity),
    queryFn: ({ pageParam }) =>
      getAssetVulnerabilities(assetId, pageParam, 10, severity),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(assetId),
  });
}
