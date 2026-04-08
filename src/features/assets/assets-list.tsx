"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";
import { AssetList } from "@/features/assets/asset-list";
import { filterAssets } from "@/features/assets/filter-assets";
import { useAssetsQuery } from "@/features/assets/use-assets-query";

export function AssetsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const withVulnerabilities = searchParams.get("vuln") === "1";
  const withThreats = searchParams.get("threat") === "1";
  const sortBy =
    (searchParams.get("sortBy") as AssetSortBy | null) ?? "createdAt";
  const sortOrder =
    (searchParams.get("sortOrder") as AssetSortOrder | null) ?? "desc";

  const {
    data,
    error,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useAssetsQuery(searchQuery, sortBy, sortOrder);

  const allAssets = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter by vulnerabilities/threats in frontend since the BE doesn't support these filters yet
  const filteredAssets = filterAssets(allAssets, "", {
    withVulnerabilities,
    withThreats,
  });

  const hasActiveFilters = Boolean(
    searchQuery ||
      withVulnerabilities ||
      withThreats ||
      sortBy !== "createdAt" ||
      sortOrder !== "desc",
  );

  const updateFilters = (nextValues: {
    query?: string;
    withVulnerabilities?: boolean;
    withThreats?: boolean;
    sortBy?: AssetSortBy;
    sortOrder?: AssetSortOrder;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = nextValues.query ?? searchQuery;
    const nextWithVulnerabilities =
      nextValues.withVulnerabilities ?? withVulnerabilities;
    const nextWithThreats = nextValues.withThreats ?? withThreats;
    const nextSortBy = nextValues.sortBy ?? sortBy;
    const nextSortOrder = nextValues.sortOrder ?? sortOrder;

    if (nextQuery.trim()) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

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

    if (nextSortBy !== "createdAt" || nextSortOrder !== "desc") {
      params.set("sortBy", nextSortBy);
      params.set("sortOrder", nextSortOrder);
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    const nextQueryString = params.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
      {
        scroll: false,
      },
    );
  };

  return (
    <section className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-5 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Review your assets and latest scan activity.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <label
          htmlFor="assets-search"
          className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground"
        >
          Search
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
            className="h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>

        <label
          htmlFor="assets-sort"
          className="flex flex-col gap-2 text-sm text-muted-foreground sm:w-48"
        >
          Sort by
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
            className="h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="lastScan-desc">Recently Scanned</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={withVulnerabilities}
          onClick={() =>
            updateFilters({
              withVulnerabilities: !withVulnerabilities,
            })
          }
          className="aria-pressed:border-primary/60 aria-pressed:bg-primary/10 aria-pressed:text-primary"
        >
          With vulnerabilities
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={withThreats}
          onClick={() =>
            updateFilters({
              withThreats: !withThreats,
            })
          }
          className="aria-pressed:border-primary/60 aria-pressed:bg-primary/10 aria-pressed:text-primary"
        >
          With threats
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            updateFilters({
              query: "",
              withVulnerabilities: false,
              withThreats: false,
              sortBy: "createdAt",
              sortOrder: "desc",
            })
          }
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </div>

      {isLoading ? (
        <AssetsListSkeleton />
      ) : error ? (
        <ErrorState
          isRetrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : allAssets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          No assets available.
        </p>
      ) : filteredAssets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          No assets match the current filters.
        </p>
      ) : (
        <>
          <AssetList assets={filteredAssets} />
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading more..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
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
