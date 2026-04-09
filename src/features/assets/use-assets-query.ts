"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAssets } from "@/api/assets";
import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";

export function assetsPageQueryKey(
  page: number,
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
    "page",
    {
      page,
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

export function useAssetsPageQuery(
  page: number,
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
  lastScanFrom?: string,
  lastScanTo?: string,
  hasVulnerabilities?: boolean,
  hasThreats?: boolean,
  hasFindings?: boolean,
) {
  return useQuery({
    queryKey: assetsPageQueryKey(
      page,
      search,
      sortBy,
      sortOrder,
      lastScanFrom,
      lastScanTo,
      hasVulnerabilities,
      hasThreats,
      hasFindings,
    ),
    queryFn: () =>
      getAssets(
        page,
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
    placeholderData: keepPreviousData,
  });
}
