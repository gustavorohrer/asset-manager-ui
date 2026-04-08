"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getAssets } from "@/api/assets";

export function assetsQueryKey(search?: string) {
  return ["assets", { search }] as const;
}

export function useAssetsQuery(search?: string) {
  return useInfiniteQuery({
    queryKey: assetsQueryKey(search),
    queryFn: ({ pageParam }) => getAssets(pageParam, 20, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
