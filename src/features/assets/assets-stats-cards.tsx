"use client";

import { Boxes, Bug, type LucideIcon, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetRiskSummary } from "@/domain/assets";
import { calculateRiskPercentage } from "@/features/assets/calculate-risk-percentage";
import {
  getThreatColor,
  getVulnerabilityColor,
} from "@/features/assets/finding-colors";
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
  icon: LucideIcon;
  label: string;
  value: number;
};

const THREAT_STATS_COLOR = getThreatColor("HIGH");
const VULNERABILITY_STATS_COLOR = getVulnerabilityColor("MEDIUM");

const withAlpha = (hexColor: string, alphaSuffix: string): string =>
  `${hexColor}${alphaSuffix}`;

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
      icon: Boxes,
      label: "Total Inventory",
      value: summary?.total ?? 0,
    },
    {
      filter: "threats",
      icon: ShieldAlert,
      label: "With Threats",
      value: summary?.withThreats ?? 0,
    },
    {
      filter: "vulnerabilities",
      icon: Bug,
      label: "With Vulnerabilities",
      value: summary?.withVulnerabilities ?? 0,
    },
  ];

  return (
    <ul
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label="Asset risk summary"
    >
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;
        const isRiskCard =
          card.filter === "threats" || card.filter === "vulnerabilities";
        const accentColor =
          card.filter === "vulnerabilities"
            ? VULNERABILITY_STATS_COLOR
            : card.filter === "threats"
              ? THREAT_STATS_COLOR
              : undefined;
        const Icon = card.icon;
        const riskPercentage =
          summary && isRiskCard
            ? calculateRiskPercentage(card.value, summary.total)
            : null;
        const accentCardStyle = accentColor
          ? {
              borderColor: withAlpha(accentColor, isActive ? "99" : "66"),
              backgroundColor: withAlpha(accentColor, isActive ? "20" : "14"),
            }
          : undefined;

        return (
          <li key={card.filter}>
            <Button
              type="button"
              variant="outline"
              aria-pressed={isActive}
              data-pressed={isActive || undefined}
              onClick={() => onFilterChange(card.filter)}
              className={cn(
                "h-full w-full justify-start rounded-lg border px-4 py-3 text-left",
                !accentColor && isActive && "border-primary/60 bg-primary/10",
              )}
              style={accentCardStyle}
            >
              <span className="flex w-full flex-col gap-2">
                <span className="flex w-full items-center justify-between gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                    style={
                      accentColor
                        ? { color: accentColor }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {card.label}
                  </span>
                  <span
                    className="text-2xl font-semibold leading-none tabular-nums"
                    style={
                      accentColor
                        ? { color: accentColor }
                        : { color: "inherit" }
                    }
                  >
                    {card.value.toLocaleString("en-US")}
                  </span>
                </span>

                {accentColor && riskPercentage !== null && (
                  <span className="space-y-1">
                    <span className="block text-[11px] text-muted-foreground">
                      {riskPercentage}% of total assets
                    </span>
                    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                      <span
                        className="block h-full rounded-full transition-[width] duration-300 ease-out"
                        style={{
                          width: `${riskPercentage}%`,
                          backgroundColor: accentColor,
                        }}
                      />
                    </span>
                  </span>
                )}
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
