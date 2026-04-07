"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AssetList } from "@/features/assets/asset-list";
import { filterAssets } from "@/features/assets/filter-assets";
import { useAssetsQuery } from "@/features/assets/use-assets-query";

export function AssetsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading, isFetching, refetch } = useAssetsQuery();
  const assets = data ?? [];
  const filteredAssets = filterAssets(assets, searchQuery);

  return (
    <section className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-5 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Review your assets and latest scan activity.
        </p>
      </header>

      <label
        htmlFor="assets-search"
        className="flex flex-col gap-2 text-sm text-muted-foreground"
      >
        Search
        <input
          id="assets-search"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or description"
          className="h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
      </label>

      {isLoading ? (
        <AssetsListSkeleton />
      ) : error ? (
        <ErrorState
          isRetrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : assets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          No assets available.
        </p>
      ) : filteredAssets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          No assets match your search.
        </p>
      ) : (
        <AssetList assets={filteredAssets} />
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
