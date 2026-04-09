"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAssets } from "@/api/assets";
import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";

export function assetsQueryKey(
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
  lastScanFrom?: string,
  lastScanTo?: string,
  hasVulnerabilities?: boolean,
  hasThreats?: boolean,
  hasFindings?: boolean,
) {
  return [
    "assets",
    {
      search,
      sortBy,
      sortOrder,
      lastScanFrom,
      lastScanTo,
      hasVulnerabilities,
      hasThreats,
      hasFindings,
    },
  ] as const;
}

export function useAssetsQuery(
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
  lastScanFrom?: string,
  lastScanTo?: string,
  hasVulnerabilities?: boolean,
  hasThreats?: boolean,
  hasFindings?: boolean,
) {
  return useInfiniteQuery({
    queryKey: assetsQueryKey(
      search,
      sortBy,
      sortOrder,
      lastScanFrom,
      lastScanTo,
      hasVulnerabilities,
      hasThreats,
      hasFindings,
    ),
    queryFn: ({ pageParam }) =>
      getAssets(
        pageParam,
        20,
        search,
        sortBy,
        sortOrder,
        lastScanFrom,
        lastScanTo,
        hasVulnerabilities,
        hasThreats,
        hasFindings,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
