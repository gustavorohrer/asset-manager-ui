"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  type AssetSortBy,
  type AssetSortOrder,
  assetSortBySchema,
  assetSortOrderSchema,
} from "@/domain/assets";

export type AssetsListFilterUpdates = {
  query?: string;
  withVulnerabilities?: boolean;
  withThreats?: boolean;
  hasFindings?: boolean;
  sortBy?: AssetSortBy;
  sortOrder?: AssetSortOrder;
  lastScanFrom?: string;
  lastScanTo?: string;
  page?: number;
};

type UpdateFiltersOptions = {
  resetPage?: boolean;
};

type AssetsListUrlFilters = {
  searchQuery: string;
  withVulnerabilities?: boolean;
  withThreats?: boolean;
  hasFindings?: boolean;
  sortBy: AssetSortBy;
  sortOrder: AssetSortOrder;
  lastScanFrom: string;
  lastScanTo: string;
  page: number;
  hasActiveExclusionFilters: boolean;
  hasActiveFilters: boolean;
  hasAdvancedFiltersActive: boolean;
  updateFilters: (
    nextValues: AssetsListFilterUpdates,
    options?: UpdateFiltersOptions,
  ) => void;
};

export function useAssetsListUrlFilters(): AssetsListUrlFilters {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const withVulnerabilities =
    searchParams.get("vuln") === "1" ? true : undefined;
  const withThreats = searchParams.get("threat") === "1" ? true : undefined;
  const hasFindings = searchParams.get("findings") === "1" ? true : undefined;
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
  const lastScanFrom = searchParams.get("lastScanFrom") ?? "";
  const lastScanTo = searchParams.get("lastScanTo") ?? "";
  const page = parsePage(searchParams.get("page"));

  const hasActiveExclusionFilters = Boolean(
    searchQuery ||
      withVulnerabilities ||
      withThreats ||
      hasFindings ||
      lastScanFrom ||
      lastScanTo,
  );

  const hasActiveFilters = Boolean(
    hasActiveExclusionFilters || sortBy !== "createdAt" || sortOrder !== "desc",
  );

  const updateFilters = useCallback(
    (nextValues: AssetsListFilterUpdates, options?: UpdateFiltersOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      const shouldResetPage = options?.resetPage ?? true;
      const nextQuery = nextValues.query ?? searchQuery;
      const nextWithVulnerabilities =
        nextValues.withVulnerabilities ?? withVulnerabilities;
      const nextWithThreats = nextValues.withThreats ?? withThreats;
      const nextHasFindings = nextValues.hasFindings ?? hasFindings;
      const nextSortBy = nextValues.sortBy ?? sortBy;
      const nextSortOrder = nextValues.sortOrder ?? sortOrder;
      const nextLastScanFrom =
        nextValues.lastScanFrom !== undefined
          ? nextValues.lastScanFrom
          : lastScanFrom;
      const nextLastScanTo =
        nextValues.lastScanTo !== undefined
          ? nextValues.lastScanTo
          : lastScanTo;
      const nextPage = shouldResetPage ? 1 : (nextValues.page ?? page);

      if (nextQuery.trim()) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      if (nextHasFindings) {
        params.set("findings", "1");
        params.delete("vuln");
        params.delete("threat");
      } else {
        params.delete("findings");

        if (nextWithVulnerabilities) {
          params.set("vuln", "1");
        } else {
          params.delete("vuln");
        }

        if (nextWithThreats) {
          params.set("threat", "1");
        } else {
          params.delete("threat");
        }
      }

      if (nextSortBy !== "createdAt" || nextSortOrder !== "desc") {
        params.set("sortBy", nextSortBy);
        params.set("sortOrder", nextSortOrder);
      } else {
        params.delete("sortBy");
        params.delete("sortOrder");
      }

      if (nextLastScanFrom) {
        params.set("lastScanFrom", nextLastScanFrom);
      } else {
        params.delete("lastScanFrom");
      }

      if (nextLastScanTo) {
        params.set("lastScanTo", nextLastScanTo);
      } else {
        params.delete("lastScanTo");
      }

      if (nextPage > 1) {
        params.set("page", nextPage.toString());
      } else {
        params.delete("page");
      }

      const nextQueryString = params.toString();
      router.replace(
        nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
        {
          scroll: false,
        },
      );
    },
    [
      hasFindings,
      lastScanFrom,
      lastScanTo,
      page,
      pathname,
      router,
      searchParams,
      searchQuery,
      sortBy,
      sortOrder,
      withThreats,
      withVulnerabilities,
    ],
  );

  return {
    searchQuery,
    withVulnerabilities,
    withThreats,
    hasFindings,
    sortBy,
    sortOrder,
    lastScanFrom,
    lastScanTo,
    page,
    hasActiveExclusionFilters,
    hasActiveFilters,
    hasAdvancedFiltersActive: Boolean(lastScanFrom || lastScanTo),
    updateFilters,
  };
}

function parsePage(rawPage: string | null): number {
  if (!rawPage) {
    return 1;
  }

  const parsedPage = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

function parseSortBy(rawSortBy: string | null): AssetSortBy {
  const parsedSortBy = assetSortBySchema.safeParse(rawSortBy);
  return parsedSortBy.success ? parsedSortBy.data : "createdAt";
}

function parseSortOrder(rawSortOrder: string | null): AssetSortOrder {
  const parsedSortOrder = assetSortOrderSchema.safeParse(rawSortOrder);
  return parsedSortOrder.success ? parsedSortOrder.data : "desc";
}
