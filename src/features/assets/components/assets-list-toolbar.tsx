"use client";

import { ChevronDown, Search } from "lucide-react";

import type { AssetSortBy, AssetSortOrder } from "@/domain/assets";

type AssetsListToolbarProps = {
  localSearchQuery: string;
  sortBy: AssetSortBy;
  sortOrder: AssetSortOrder;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: AssetSortBy, sortOrder: AssetSortOrder) => void;
};

export function AssetsListToolbar({
  localSearchQuery,
  sortBy,
  sortOrder,
  onSearchFocus,
  onSearchBlur,
  onSearchChange,
  onSortChange,
}: AssetsListToolbarProps) {
  return (
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
            value={localSearchQuery}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            placeholder="Search by asset name"
            className={`h-10 w-full rounded-md border border-border/70 bg-background/80 pl-10 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary ${localSearchQuery ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10" : ""}`}
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
              onSortChange(nextSortBy, nextSortOrder);
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
  );
}
