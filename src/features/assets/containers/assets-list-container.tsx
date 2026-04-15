"use client";

import { useEffect, useRef, useState } from "react";

import { AssetsListView } from "@/features/assets/components/assets-list-view";
import type { AssetStatsFilter } from "@/features/assets/components/assets-stats-cards";
import { useAssetsListUrlFilters } from "@/features/assets/hooks/use-assets-list-url-filters";
import { useAssetsPageQuery } from "@/features/assets/hooks/use-assets-query";
import { useAssetsSummaryQuery } from "@/features/assets/hooks/use-assets-summary-query";

const RISK_PRIORITY_DISMISSED_SESSION_KEY = "assets-risk-priority-dismissed";
const SEARCH_DEBOUNCE_MS = 300;

export function AssetsListContainer() {
  const assetsSectionRef = useRef<HTMLElement>(null);
  const shouldScrollToSectionOnPageChange = useRef(false);

  const {
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
    hasAdvancedFiltersActive,
    updateFilters,
  } = useAssetsListUrlFilters();

  const [hasDismissedRiskPriority, setHasDismissedRiskPriority] =
    useState(false);
  const [didLoadRiskPriorityPreference, setDidLoadRiskPriorityPreference] =
    useState(false);
  const hasAutoRiskPriorityCheckRun = useRef(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localLastScanFrom, setLocalLastScanFrom] = useState(lastScanFrom);
  const [localLastScanTo, setLocalLastScanTo] = useState(lastScanTo);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(lastScanFrom || lastScanTo),
  );

  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(
      RISK_PRIORITY_DISMISSED_SESSION_KEY,
    );
    setHasDismissedRiskPriority(storedValue === "1");
    setDidLoadRiskPriorityPreference(true);
  }, []);

  useEffect(() => {
    setLocalLastScanFrom(lastScanFrom);
    setLocalLastScanTo(lastScanTo);
  }, [lastScanFrom, lastScanTo]);

  useEffect(() => {
    if (isSearchInputFocused) {
      return;
    }

    setLocalSearchQuery(searchQuery);
  }, [isSearchInputFocused, searchQuery]);

  const { data, error, isLoading, isFetching, refetch } = useAssetsPageQuery({
    page,
    search: searchQuery,
    sortBy,
    sortOrder,
    lastScanFrom: lastScanFrom ? `${lastScanFrom}T00:00:00Z` : undefined,
    lastScanTo: lastScanTo ? `${lastScanTo}T23:59:59Z` : undefined,
    hasVulnerabilities: withVulnerabilities,
    hasThreats: withThreats,
    hasFindings,
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useAssetsSummaryQuery();

  const filteredAssets = data?.data ?? [];
  const pagination = data?.pagination;
  const isAssetsUpdating = isFetching && !isLoading;
  const isSummaryUpdating = isSummaryFetching && !isSummaryLoading;
  const asyncStatusMessage = isLoading
    ? "Loading assets."
    : isAssetsUpdating
      ? "Updating results..."
      : isSummaryUpdating
        ? "Updating risk summary..."
        : null;

  useEffect(() => {
    if (localSearchQuery === searchQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateFilters({
        query: localSearchQuery,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [localSearchQuery, searchQuery, updateFilters]);

  const isDateRangeInvalid = Boolean(
    localLastScanFrom && localLastScanTo && localLastScanFrom > localLastScanTo,
  );
  const dateRangeErrorId = "assets-date-range-error";

  const hasRiskInInventory = Boolean(
    summary && (summary.withVulnerabilities > 0 || summary.withThreats > 0),
  );

  useEffect(() => {
    if (
      !didLoadRiskPriorityPreference ||
      hasAutoRiskPriorityCheckRun.current ||
      isSummaryLoading ||
      isSummaryError ||
      !summary
    ) {
      return;
    }

    hasAutoRiskPriorityCheckRun.current = true;

    if (
      hasDismissedRiskPriority ||
      hasActiveExclusionFilters ||
      !hasRiskInInventory
    ) {
      return;
    }

    updateFilters({
      withVulnerabilities: false,
      withThreats: false,
      hasFindings: true,
    });
  }, [
    didLoadRiskPriorityPreference,
    hasDismissedRiskPriority,
    hasActiveExclusionFilters,
    hasRiskInInventory,
    isSummaryLoading,
    isSummaryError,
    summary,
    updateFilters,
  ]);

  useEffect(() => {
    if (!shouldScrollToSectionOnPageChange.current) {
      return;
    }

    shouldScrollToSectionOnPageChange.current = false;
    assetsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  const activeStatsFilter: AssetStatsFilter | null = hasFindings
    ? null
    : withVulnerabilities && withThreats
      ? null
      : withVulnerabilities
        ? "vulnerabilities"
        : withThreats
          ? "threats"
          : "all";

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages === 0 || page <= pagination.totalPages) {
      return;
    }

    updateFilters(
      {
        page: pagination.totalPages,
      },
      {
        resetPage: false,
      },
    );
  }, [page, pagination, updateFilters]);

  const handleStatsFilterChange = (filter: AssetStatsFilter) => {
    if (filter === "all") {
      updateFilters({
        query: "",
        withVulnerabilities: false,
        withThreats: false,
        hasFindings: false,
        lastScanFrom: "",
        lastScanTo: "",
      });
      return;
    }

    updateFilters({
      withVulnerabilities: filter === "vulnerabilities",
      withThreats: filter === "threats",
      hasFindings: false,
    });
  };

  const clearRiskPriority = () => {
    window.sessionStorage.setItem(RISK_PRIORITY_DISMISSED_SESSION_KEY, "1");
    setHasDismissedRiskPriority(true);
    updateFilters({
      withVulnerabilities: false,
      withThreats: false,
      hasFindings: false,
    });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    shouldScrollToSectionOnPageChange.current = true;

    updateFilters(
      {
        page: nextPage,
      },
      {
        resetPage: false,
      },
    );
  };

  return (
    <AssetsListView
      sectionRef={assetsSectionRef}
      summary={summary}
      activeStatsFilter={activeStatsFilter}
      isSummaryLoading={isSummaryLoading}
      isSummaryError={isSummaryError}
      onStatsFilterChange={handleStatsFilterChange}
      onRetrySummary={() => {
        void refetchSummary();
      }}
      assets={filteredAssets}
      asyncStatusMessage={asyncStatusMessage}
      hasFindings={hasFindings}
      onClearRiskPriority={clearRiskPriority}
      localSearchQuery={localSearchQuery}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSearchFocus={() => setIsSearchInputFocused(true)}
      onSearchBlur={() => setIsSearchInputFocused(false)}
      onSearchChange={setLocalSearchQuery}
      onSortChange={(nextSortBy, nextSortOrder) => {
        updateFilters({
          sortBy: nextSortBy,
          sortOrder: nextSortOrder,
        });
      }}
      showAdvancedFilters={showAdvancedFilters}
      hasAdvancedFiltersActive={hasAdvancedFiltersActive}
      withVulnerabilities={withVulnerabilities}
      withThreats={withThreats}
      hasActiveFilters={hasActiveFilters}
      localLastScanFrom={localLastScanFrom}
      localLastScanTo={localLastScanTo}
      lastScanFrom={lastScanFrom}
      lastScanTo={lastScanTo}
      isDateRangeInvalid={isDateRangeInvalid}
      dateRangeErrorId={dateRangeErrorId}
      onToggleAdvancedFilters={() =>
        setShowAdvancedFilters(!showAdvancedFilters)
      }
      onToggleVulnerabilities={() =>
        updateFilters({
          withVulnerabilities: !withVulnerabilities,
          hasFindings: false,
        })
      }
      onToggleThreats={() =>
        updateFilters({
          withThreats: !withThreats,
          hasFindings: false,
        })
      }
      onClearFilters={() => {
        updateFilters({
          query: "",
          withVulnerabilities: false,
          withThreats: false,
          hasFindings: false,
          sortBy: "createdAt",
          sortOrder: "desc",
          lastScanFrom: "",
          lastScanTo: "",
        });
      }}
      onLocalLastScanFromChange={setLocalLastScanFrom}
      onLocalLastScanToChange={setLocalLastScanTo}
      onApplyDateRange={() => {
        updateFilters({
          lastScanFrom: localLastScanFrom,
          lastScanTo: localLastScanTo,
        });
      }}
      pagination={pagination}
      isLoading={isLoading}
      isAssetsUpdating={isAssetsUpdating}
      error={error}
      isFetching={isFetching}
      onRetryAssets={() => {
        void refetch();
      }}
      onPageChange={handlePageChange}
    />
  );
}
