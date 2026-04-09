"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Filter,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AssetThreat, RiskLevel } from "@/domain/threats";
import { cn } from "@/lib/utils";
import { AssetVulnerabilitiesSkeleton } from "./asset-vulnerabilities-skeleton";
import { formatAssetDate } from "./format-asset-date";
import { useAssetThreatsQuery } from "./use-asset-threats-query";

const RISK_LEVELS: (RiskLevel | "ALL")[] = ["ALL", "HIGH", "MEDIUM", "LOW"];

const RISK_ORDER: Record<RiskLevel, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const RISK_COLORS: Record<RiskLevel, string> = {
  HIGH: "#e84749",
  MEDIUM: "#d89614",
  LOW: "#595959",
};

export function AssetThreats({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawRiskLevel = searchParams.get("riskLevel")?.toUpperCase();
  const currentRiskLevel = RISK_LEVELS.find((s) => s === rawRiskLevel) || "ALL";

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useAssetThreatsQuery(
    assetId,
    currentRiskLevel === "ALL" ? undefined : currentRiskLevel,
  );

  const threats = data?.pages.flatMap((page) => page.data) ?? [];
  const totalThreats = data?.pages[0]?.pagination.total ?? 0;

  const handleRiskLevelChange = (riskLevel: RiskLevel | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (riskLevel === "ALL") {
      params.delete("riskLevel");
    } else {
      params.set("riskLevel", riskLevel.toLowerCase());
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Threats</h2>
          {!isLoading && !isError && (
            <p className="text-xs text-muted-foreground">
              {totalThreats} {totalThreats === 1 ? "threat" : "threats"} found
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground mr-1" />
          {RISK_LEVELS.map((level) => (
            <Button
              key={level}
              variant={currentRiskLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => handleRiskLevelChange(level)}
              className={cn(
                "h-7 px-2.5 text-[10px] font-bold transition-all",
                currentRiskLevel !== level &&
                  "text-muted-foreground hover:text-foreground",
                currentRiskLevel === level &&
                  level !== "ALL" &&
                  "border-transparent",
              )}
              style={
                currentRiskLevel === level && level !== "ALL"
                  ? {
                      backgroundColor: RISK_COLORS[level],
                      color: "white",
                    }
                  : {}
              }
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && <AssetVulnerabilitiesSkeleton />}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mb-3 size-8 text-destructive" />
          <h3 className="mb-1 text-base font-semibold">
            Error loading threats
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Could not retrieve threat data for this asset.
          </p>
          <Button
            onClick={() => refetch()}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && threats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/50 bg-background/20">
          <p className="text-sm text-muted-foreground italic">
            {currentRiskLevel === "ALL"
              ? "No threats found for latest scan"
              : `No ${currentRiskLevel.toLowerCase()} threats found`}
          </p>
          {currentRiskLevel !== "ALL" && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleRiskLevelChange("ALL")}
              className="mt-2 text-primary"
            >
              Clear filter
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && threats.length > 0 && (
        <>
          <div className="space-y-8">
            {Object.entries(
              threats.reduce(
                (acc, threat) => {
                  if (!acc[threat.componentName]) {
                    acc[threat.componentName] = [];
                  }
                  acc[threat.componentName].push(threat);
                  return acc;
                },
                {} as Record<string, AssetThreat[]>,
              ),
            ).map(([componentName, items]) => (
              <div key={componentName} className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 group/title">
                  <span className="h-1 w-4 bg-primary/30 rounded-full" />
                  <a
                    href={`#component-${items[0]?.componentId}`}
                    className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {componentName}
                    <ArrowUpRight className="size-3 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                  </a>
                </h3>
                <ul className="grid gap-3">
                  {items
                    .sort(
                      (a, b) =>
                        RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel],
                    )
                    .map((threat) => (
                      <li
                        key={threat.id}
                        className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/30 p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                color: RISK_COLORS[threat.riskLevel],
                                borderColor: RISK_COLORS[threat.riskLevel],
                                backgroundColor: `${RISK_COLORS[threat.riskLevel]}1A`,
                              }}
                            >
                              {threat.riskLevel}
                            </span>
                            {threat.riskLevel === "HIGH" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#e84749] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                <ShieldAlert className="size-3" />
                                High risk
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">
                              {threat.type}
                            </span>
                          </div>
                          <time className="text-[10px] text-muted-foreground font-medium">
                            {formatAssetDate(threat.performedAt)}
                          </time>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {threat.description}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

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
