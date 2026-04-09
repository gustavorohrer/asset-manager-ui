"use client";

import { Calendar, ChevronDown, Filter, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";
import { AssetList } from "@/features/assets/asset-list";
import {
  type AssetStatsFilter,
  AssetsStatsCards,
} from "@/features/assets/assets-stats-cards";
import { useAssetsPageQuery } from "@/features/assets/use-assets-query";
import { useAssetsSummaryQuery } from "@/features/assets/use-assets-summary-query";

const RISK_PRIORITY_DISMISSED_SESSION_KEY = "assets-risk-priority-dismissed";

export function AssetsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const assetsSectionRef = useRef<HTMLElement>(null);
  const shouldScrollToSectionOnPageChange = useRef(false);
  const searchQuery = searchParams.get("q") ?? "";
  const withVulnerabilities =
    searchParams.get("vuln") === "1" ? true : undefined;
  const withThreats = searchParams.get("threat") === "1" ? true : undefined;
  const hasFindings = searchParams.get("findings") === "1" ? true : undefined;
  const sortBy =
    (searchParams.get("sortBy") as AssetSortBy | null) ?? "createdAt";
  const sortOrder =
    (searchParams.get("sortOrder") as AssetSortOrder | null) ?? "desc";
  const lastScanFrom = searchParams.get("lastScanFrom") ?? "";
  const lastScanTo = searchParams.get("lastScanTo") ?? "";
  const page = parsePage(searchParams.get("page"));
  const [hasDismissedRiskPriority, setHasDismissedRiskPriority] =
    useState(false);
  const [didLoadRiskPriorityPreference, setDidLoadRiskPriorityPreference] =
    useState(false);
  const hasAutoRiskPriorityCheckRun = useRef(false);

  const [localLastScanFrom, setLocalLastScanFrom] = useState(lastScanFrom);
  const [localLastScanTo, setLocalLastScanTo] = useState(lastScanTo);

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

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(lastScanFrom || lastScanTo),
  );

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
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useAssetsSummaryQuery();

  const filteredAssets = data?.data ?? [];
  const pagination = data?.pagination;

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
    (
      nextValues: {
        query?: string;
        withVulnerabilities?: boolean;
        withThreats?: boolean;
        hasFindings?: boolean;
        sortBy?: AssetSortBy;
        sortOrder?: AssetSortOrder;
        lastScanFrom?: string;
        lastScanTo?: string;
        page?: number;
      },
      options?: { resetPage?: boolean },
    ) => {
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

  const isDateRangeInvalid =
    localLastScanFrom && localLastScanTo && localLastScanFrom > localLastScanTo;

  const hasAdvancedFiltersActive = Boolean(lastScanFrom || lastScanTo);
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

      {hasFindings && (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-foreground">
            You are viewing a risk-prioritized inventory (assets with
            vulnerabilities or threats).
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={clearRiskPriority}
          >
            View full inventory
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <label
          htmlFor="assets-search"
          className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground"
        >
          Search
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="assets-search"
              type="text"
              value={searchQuery}
              onChange={(event) =>
                updateFilters({
                  query: event.target.value,
                })
              }
              placeholder="Search by name or description"
              className={`h-10 w-full rounded-md border border-border/70 bg-background/80 pl-10 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary ${searchQuery ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10" : ""}`}
            />
          </div>
        </label>

        <label
          htmlFor="assets-sort"
          className="flex flex-col gap-2 text-sm text-muted-foreground sm:w-48"
        >
          Sort by
          <div className="relative">
            <select
              id="assets-sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] = event.target.value.split(
                  "-",
                ) as [AssetSortBy, AssetSortOrder];
                updateFilters({
                  sortBy: nextSortBy,
                  sortOrder: nextSortOrder,
                });
              }}
              className={`h-10 w-full appearance-none rounded-md border border-border/70 bg-background/80 pl-3 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary ${sortBy !== "createdAt" || sortOrder !== "desc" ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10" : ""}`}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="lastScan-desc">Recently Scanned</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          </div>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={showAdvancedFilters}
          data-pressed={showAdvancedFilters || undefined}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {hasAdvancedFiltersActive && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-pressed={withVulnerabilities || undefined}
          aria-pressed={Boolean(withVulnerabilities)}
          onClick={() =>
            updateFilters({
              withVulnerabilities: !withVulnerabilities,
              hasFindings: false,
            })
          }
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          With vulnerabilities
          {withVulnerabilities && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-pressed={withThreats || undefined}
          aria-pressed={Boolean(withThreats)}
          onClick={() =>
            updateFilters({
              withThreats: !withThreats,
              hasFindings: false,
            })
          }
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          With threats
          {withThreats && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
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
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </div>

      {showAdvancedFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/50 bg-background/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last scan from
            </span>
            <input
              type="date"
              value={localLastScanFrom}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => e.currentTarget.showPicker()}
              onChange={(e) => setLocalLastScanFrom(e.target.value)}
              className={`h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-all focus:border-primary ${localLastScanFrom ? "border-primary/60 bg-primary/5" : ""}`}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last scan to
            </span>
            <input
              type="date"
              value={localLastScanTo}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => e.currentTarget.showPicker()}
              onChange={(e) => setLocalLastScanTo(e.target.value)}
              className={`h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-all focus:border-primary ${localLastScanTo ? "border-primary/60 bg-primary/5" : ""} ${isDateRangeInvalid ? "border-red-500/50 bg-red-500/5" : ""}`}
            />
          </label>
          <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-2 lg:flex-row lg:items-end">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                updateFilters({
                  lastScanFrom: localLastScanFrom,
                  lastScanTo: localLastScanTo,
                });
              }}
              disabled={
                isDateRangeInvalid ||
                (localLastScanFrom === lastScanFrom &&
                  localLastScanTo === lastScanTo)
              }
              className="px-8"
            >
              Apply
            </Button>
            {isDateRangeInvalid && (
              <div className="flex items-center text-xs text-red-500/80">
                "From" date cannot be after "To" date.
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <AssetsListSkeleton />
      ) : error ? (
        <ErrorState
          isRetrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : filteredAssets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          {hasActiveFilters
            ? "No assets match the current filters."
            : "No assets available."}
        </p>
      ) : (
        <>
          <AssetList assets={filteredAssets} />
          {pagination && pagination.totalPages > 1 && (
            <AssetsPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              isFetching={isFetching}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  );
}

type AssetsPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  onPageChange: (nextPage: number) => void;
};

function AssetsPagination({
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
}: AssetsPaginationProps) {
  const pageItems = getVisiblePageItems(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="space-y-3 pt-4">
      <p className="text-center text-xs text-muted-foreground">
        Page {page} of {totalPages} ({total} assets)
      </p>
      <nav
        aria-label="Assets pagination"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching || isFirstPage}
          onClick={() => onPageChange(1)}
        >
          First
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching || isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: deterministic short pagination list with repeated separators
              key={`${item}-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              size="sm"
              variant={item === page ? "default" : "outline"}
              disabled={isFetching}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={isFetching || isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching || isLastPage}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </Button>
      </nav>
    </div>
  );
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

type PageItem = number | "ellipsis";

function getVisiblePageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  const items: PageItem[] = [1];

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

function AssetsListSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders while loading
          key={index}
          className="space-y-3 rounded-lg border border-border/70 bg-card/70 p-4"
        >
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

type ErrorStateProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

function ErrorState({ isRetrying, onRetry }: ErrorStateProps) {
  return (
    <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
      <p className="text-destructive">
        Failed to load assets. Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
}
