"use client";

import { useEffect, useRef, useState } from "react";

import { AssetsListFilterControls } from "@/features/assets/assets-list-filter-controls";
import { AssetsListResults } from "@/features/assets/assets-list-results";
import { AssetsListToolbar } from "@/features/assets/assets-list-toolbar";
import { AssetsRiskPriorityBanner } from "@/features/assets/assets-risk-priority-banner";
import type { AssetStatsFilter } from "@/features/assets/assets-stats-cards";
import { AssetsStatsCards } from "@/features/assets/assets-stats-cards";
import { TopRiskyAssetsInsight } from "@/features/assets/top-risky-assets-insight";
import { useAssetsListUrlFilters } from "@/features/assets/use-assets-list-url-filters";
import { useAssetsPageQuery } from "@/features/assets/use-assets-query";
import { useAssetsSummaryQuery } from "@/features/assets/use-assets-summary-query";

const RISK_PRIORITY_DISMISSED_SESSION_KEY = "assets-risk-priority-dismissed";
const SEARCH_DEBOUNCE_MS = 300;

export function AssetsList() {
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

  const { data, error, isLoading, isFetching, refetch } = useAssetsPageQuery(
    page,
    searchQuery,
    sortBy,
    sortOrder,
    lastScanFrom ? `${lastScanFrom}T00:00:00Z` : undefined,
    lastScanTo ? `${lastScanTo}T23:59:59Z` : undefined,
    withVulnerabilities,
    withThreats,
    hasFindings,
  );

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
    <section
      ref={assetsSectionRef}
      aria-busy={isLoading || isAssetsUpdating || isSummaryLoading}
      className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-5 sm:p-6"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Review your assets and latest scan activity.
        </p>
      </header>

      <AssetsStatsCards
        summary={summary}
        activeFilter={activeStatsFilter}
        isLoading={isSummaryLoading}
        isError={isSummaryError}
        onFilterChange={handleStatsFilterChange}
        onRetry={() => {
          void refetchSummary();
        }}
      />

      <TopRiskyAssetsInsight assets={filteredAssets} />

      {asyncStatusMessage && (
        <p
          role="status"
          aria-live="polite"
          className={isLoading ? "sr-only" : "text-xs text-muted-foreground"}
        >
          {asyncStatusMessage}
        </p>
      )}

      {hasFindings && (
        <AssetsRiskPriorityBanner onViewFullInventory={clearRiskPriority} />
      )}

      <AssetsListToolbar
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
      />

      <AssetsListFilterControls
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
      />

      <AssetsListResults
        assets={filteredAssets}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        isFetching={isFetching}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => {
          void refetch();
        }}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
