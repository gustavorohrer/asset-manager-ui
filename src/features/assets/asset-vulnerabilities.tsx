"use client";

import { AlertCircle, ArrowUpRight, Filter, RefreshCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type {
  AssetVulnerability,
  VulnerabilitySeverity,
} from "@/domain/vulnerabilities";
import { cn } from "@/lib/utils";
import { AssetVulnerabilitiesSkeleton } from "./asset-vulnerabilities-skeleton";
import { formatAssetDate } from "./format-asset-date";
import { useAssetVulnerabilitiesQuery } from "./use-asset-vulnerabilities-query";

const SEVERITIES: (VulnerabilitySeverity | "ALL")[] = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const SEVERITY_ORDER: Record<VulnerabilitySeverity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const SEVERITY_COLORS: Record<VulnerabilitySeverity, string> = {
  CRITICAL: "#e84749",
  HIGH: "#f56a00",
  MEDIUM: "#d89614",
  LOW: "#595959",
};

export function AssetVulnerabilities({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawSeverity = searchParams.get("severity")?.toUpperCase();
  const currentSeverity = SEVERITIES.find((s) => s === rawSeverity) || "ALL";

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useAssetVulnerabilitiesQuery(
    assetId,
    currentSeverity === "ALL" ? undefined : currentSeverity,
  );

  const vulnerabilities = data?.pages.flatMap((page) => page.data) ?? [];
  const totalVulnerabilities = data?.pages[0]?.pagination.total ?? 0;

  const handleSeverityChange = (severity: VulnerabilitySeverity | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (severity === "ALL") {
      params.delete("severity");
    } else {
      params.set("severity", severity.toLowerCase());
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="space-y-6 pt-4 border-t border-border/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Vulnerabilities
          </h2>
          {!isLoading && !isError && (
            <p className="text-xs text-muted-foreground">
              {totalVulnerabilities}{" "}
              {totalVulnerabilities === 1 ? "vulnerability" : "vulnerabilities"}{" "}
              found
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground mr-1" />
          {SEVERITIES.map((severity) => (
            <Button
              key={severity}
              variant={currentSeverity === severity ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeverityChange(severity)}
              className={cn(
                "h-7 px-2.5 text-[10px] font-bold transition-all",
                currentSeverity !== severity &&
                  "text-muted-foreground hover:text-foreground",
                currentSeverity === severity &&
                  severity !== "ALL" &&
                  "border-transparent",
              )}
              style={
                currentSeverity === severity && severity !== "ALL"
                  ? {
                      backgroundColor: SEVERITY_COLORS[severity],
                      color: "white",
                    }
                  : {}
              }
            >
              {severity}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && <AssetVulnerabilitiesSkeleton />}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mb-3 size-8 text-destructive" />
          <h3 className="mb-1 text-base font-semibold">
            Error loading vulnerabilities
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Could not retrieve vulnerability data for this asset.
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

      {!isLoading && !isError && vulnerabilities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/50 bg-background/20">
          <p className="text-sm text-muted-foreground italic">
            {currentSeverity === "ALL"
              ? "No vulnerabilities found for latest scan"
              : `No ${currentSeverity.toLowerCase()} vulnerabilities found`}
          </p>
          {currentSeverity !== "ALL" && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleSeverityChange("ALL")}
              className="mt-2 text-primary"
            >
              Clear filter
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && vulnerabilities.length > 0 && (
        <>
          <div className="space-y-8">
            {Object.entries(
              vulnerabilities.reduce(
                (acc, vuln) => {
                  if (!acc[vuln.componentName]) {
                    acc[vuln.componentName] = [];
                  }
                  acc[vuln.componentName].push(vuln);
                  return acc;
                },
                {} as Record<string, AssetVulnerability[]>,
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
                        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
                    )
                    .map((vuln) => (
                      <li
                        key={vuln.id}
                        className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/30 p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{
                              color: SEVERITY_COLORS[vuln.severity],
                              borderColor: SEVERITY_COLORS[vuln.severity],
                              backgroundColor: `${SEVERITY_COLORS[vuln.severity]}1A`,
                            }}
                          >
                            {vuln.severity}
                          </span>
                          <time className="text-[10px] text-muted-foreground font-medium">
                            {formatAssetDate(vuln.performedAt)}
                          </time>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {vuln.description}
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
