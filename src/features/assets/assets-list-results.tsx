"use client";

import { Button } from "@/components/ui/button";
import type { Asset } from "@/domain/assets";
import type { Pagination } from "@/domain/vulnerabilities";
import { AssetList } from "@/features/assets/asset-list";

type AssetsListResultsProps = {
  assets: Asset[];
  pagination?: Pagination;
  isLoading: boolean;
  error: unknown;
  isFetching: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onPageChange: (nextPage: number) => void;
};

export function AssetsListResults({
  assets,
  pagination,
  isLoading,
  error,
  isFetching,
  hasActiveFilters,
  onRetry,
  onPageChange,
}: AssetsListResultsProps) {
  if (isLoading) {
    return <AssetsListSkeleton />;
  }

  if (error) {
    return <ErrorState isRetrying={isFetching} onRetry={onRetry} />;
  }

  if (assets.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
        {hasActiveFilters
          ? "No assets match the current filters."
          : "No assets available."}
      </p>
    );
  }

  return (
    <>
      <AssetList assets={assets} />
      {pagination && pagination.totalPages > 1 && (
        <AssetsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          isFetching={isFetching}
          onPageChange={onPageChange}
        />
      )}
    </>
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
