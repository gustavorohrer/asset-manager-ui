"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetRiskSummary } from "@/domain/assets";
import { cn } from "@/lib/utils";

export type AssetStatsFilter = "all" | "vulnerabilities" | "threats";

type AssetsStatsCardsProps = {
  summary?: AssetRiskSummary;
  activeFilter: AssetStatsFilter | null;
  isLoading?: boolean;
  isError?: boolean;
  onFilterChange: (filter: AssetStatsFilter) => void;
  onRetry?: () => void;
};

type StatsCardConfig = {
  filter: AssetStatsFilter;
  label: string;
  value: number;
};

export function AssetsStatsCards({
  summary,
  activeFilter,
  isLoading = false,
  isError = false,
  onFilterChange,
  onRetry,
}: AssetsStatsCardsProps) {
  if (isLoading) {
    return <AssetsStatsCardsSkeleton />;
  }

  if (isError) {
    return (
      <div
        role="status"
        className="rounded-lg border border-border/70 bg-card/40 p-3 text-xs text-muted-foreground"
      >
        <div className="flex items-center justify-between gap-2">
          <p>Risk summary is temporarily unavailable.</p>
          {onRetry && (
            <Button type="button" size="sm" variant="ghost" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const cards: StatsCardConfig[] = [
    {
      filter: "all",
      label: "Total Inventory",
      value: summary?.total ?? 0,
    },
    {
      filter: "vulnerabilities",
      label: "With Vulnerabilities",
      value: summary?.withVulnerabilities ?? 0,
    },
    {
      filter: "threats",
      label: "With Threats",
      value: summary?.withThreats ?? 0,
    },
  ];

  return (
    <ul
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label="Asset risk summary"
    >
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;

        return (
          <li key={card.filter}>
            <Button
              type="button"
              variant="outline"
              aria-pressed={isActive}
              data-pressed={isActive || undefined}
              onClick={() => onFilterChange(card.filter)}
              className={cn(
                "h-auto w-full items-start justify-start rounded-lg border px-4 py-3 text-left",
                isActive && "border-primary/60 bg-primary/10 text-primary",
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground">
                {card.label}
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {card.value.toLocaleString("en-US")}
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function AssetsStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder entries
          key={index}
          className="rounded-lg border border-border/70 bg-card/40 p-4"
        >
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-3 h-7 w-1/2" />
        </div>
      ))}
    </div>
  );
}
