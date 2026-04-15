"use client";

import type { RefObject } from "react";

import type {
  Asset,
  AssetRiskSummary,
  AssetSortBy,
  AssetSortOrder,
} from "@/domain/assets";
import type { Pagination } from "@/domain/vulnerabilities";
import { TopRiskyAssetsInsight } from "@/features/assets/insights/top-risky-assets-insight";

import { AssetsListFilterControls } from "./assets-list-filter-controls";
import { AssetsListResults } from "./assets-list-results";
import { AssetsListToolbar } from "./assets-list-toolbar";
import { AssetsRiskPriorityBanner } from "./assets-risk-priority-banner";
import type { AssetStatsFilter } from "./assets-stats-cards";
import { AssetsStatsCards } from "./assets-stats-cards";

type AssetsListViewProps = {
  sectionRef: RefObject<HTMLElement | null>;
  summary?: AssetRiskSummary;
  activeStatsFilter: AssetStatsFilter | null;
  isSummaryLoading: boolean;
  isSummaryError: boolean;
  onStatsFilterChange: (filter: AssetStatsFilter) => void;
  onRetrySummary: () => void;
  assets: Asset[];
  asyncStatusMessage: string | null;
  hasFindings?: boolean;
  onClearRiskPriority: () => void;
  localSearchQuery: string;
  sortBy: AssetSortBy;
  sortOrder: AssetSortOrder;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (
    nextSortBy: AssetSortBy,
    nextSortOrder: AssetSortOrder,
  ) => void;
  showAdvancedFilters: boolean;
  hasAdvancedFiltersActive: boolean;
  withVulnerabilities?: boolean;
  withThreats?: boolean;
  hasActiveFilters: boolean;
  localLastScanFrom: string;
  localLastScanTo: string;
  lastScanFrom: string;
  lastScanTo: string;
  isDateRangeInvalid: boolean;
  dateRangeErrorId: string;
  onToggleAdvancedFilters: () => void;
  onToggleVulnerabilities: () => void;
  onToggleThreats: () => void;
  onClearFilters: () => void;
  onLocalLastScanFromChange: (nextDate: string) => void;
  onLocalLastScanToChange: (nextDate: string) => void;
  onApplyDateRange: () => void;
  pagination?: Pagination;
  isLoading: boolean;
  isAssetsUpdating: boolean;
  error: unknown;
  isFetching: boolean;
  onRetryAssets: () => void;
  onPageChange: (nextPage: number) => void;
};

export function AssetsListView({
  sectionRef,
  summary,
  activeStatsFilter,
  isSummaryLoading,
  isSummaryError,
  onStatsFilterChange,
  onRetrySummary,
  assets,
  asyncStatusMessage,
  hasFindings,
  onClearRiskPriority,
  localSearchQuery,
  sortBy,
  sortOrder,
  onSearchFocus,
  onSearchBlur,
  onSearchChange,
  onSortChange,
  showAdvancedFilters,
  hasAdvancedFiltersActive,
  withVulnerabilities,
  withThreats,
  hasActiveFilters,
  localLastScanFrom,
  localLastScanTo,
  lastScanFrom,
  lastScanTo,
  isDateRangeInvalid,
  dateRangeErrorId,
  onToggleAdvancedFilters,
  onToggleVulnerabilities,
  onToggleThreats,
  onClearFilters,
  onLocalLastScanFromChange,
  onLocalLastScanToChange,
  onApplyDateRange,
  pagination,
  isLoading,
  isAssetsUpdating,
  error,
  isFetching,
  onRetryAssets,
  onPageChange,
}: AssetsListViewProps) {
  return (
    <section
      ref={sectionRef}
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
        onFilterChange={onStatsFilterChange}
        onRetry={onRetrySummary}
      />

      <TopRiskyAssetsInsight assets={assets} />

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
        <AssetsRiskPriorityBanner onViewFullInventory={onClearRiskPriority} />
      )}

      <AssetsListToolbar
        localSearchQuery={localSearchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchFocus={onSearchFocus}
        onSearchBlur={onSearchBlur}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
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
        onToggleAdvancedFilters={onToggleAdvancedFilters}
        onToggleVulnerabilities={onToggleVulnerabilities}
        onToggleThreats={onToggleThreats}
        onClearFilters={onClearFilters}
        onLocalLastScanFromChange={onLocalLastScanFromChange}
        onLocalLastScanToChange={onLocalLastScanToChange}
        onApplyDateRange={onApplyDateRange}
      />

      <AssetsListResults
        assets={assets}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        isFetching={isFetching}
        hasActiveFilters={hasActiveFilters}
        onRetry={onRetryAssets}
        onPageChange={onPageChange}
      />
    </section>
  );
}
