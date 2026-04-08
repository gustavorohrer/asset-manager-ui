"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAssets } from "@/api/assets";
import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";

export function assetsQueryKey(
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
) {
  return ["assets", { search, sortBy, sortOrder }] as const;
}

export function useAssetsQuery(
  search?: string,
  sortBy?: AssetSortBy,
  sortOrder?: AssetSortOrder,
) {
  return useInfiniteQuery({
    queryKey: assetsQueryKey(search, sortBy, sortOrder),
    queryFn: ({ pageParam }) =>
      getAssets(pageParam, 20, search, sortBy, sortOrder),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
