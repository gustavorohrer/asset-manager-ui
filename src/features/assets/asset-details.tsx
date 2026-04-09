"use client";

import {
  AlertCircle,
  Bug,
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetDetailsSkeleton } from "@/features/assets/asset-details-skeleton";
import { AssetThreats } from "@/features/assets/asset-threats";
import { AssetVulnerabilities } from "@/features/assets/asset-vulnerabilities";
import {
  getFindingTabStyle,
  THREAT_CHIP_STYLE,
  THREAT_COLOR,
  VULNERABILITY_CHIP_STYLE,
  VULNERABILITY_COLOR,
} from "@/features/assets/finding-colors";
import { formatAssetDate } from "@/features/assets/format-asset-date";
import { useAssetQuery } from "@/features/assets/use-asset-query";
import { useAssetThreatsQuery } from "@/features/assets/use-asset-threats-query";
import { useAssetVulnerabilitiesQuery } from "@/features/assets/use-asset-vulnerabilities-query";
import { cn } from "@/lib/utils";

type AssetDetailsProps = {
  id: string;
};

const COMPONENT_COLLAPSE_THRESHOLD = 6;
const FINDINGS_SECTION_ID = "asset-findings-section";
type FindingsTab = "threats" | "vulnerabilities";
const FINDINGS_TAB_CLASSNAME =
  "gap-2 border-b-2 transition-[border-color,box-shadow,background-color] duration-150";

export function AssetDetails({ id }: AssetDetailsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: asset, isLoading, error, refetch } = useAssetQuery(id);
  const { data: threatsSummaryData } = useAssetThreatsQuery(id);
  const { data: vulnerabilitiesSummaryData } = useAssetVulnerabilitiesQuery(id);

  const currentTab: FindingsTab =
    searchParams.get("tab") === "vulnerabilities"
      ? "vulnerabilities"
      : "threats";

  const handleTabChange = (value: FindingsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    if (value === "threats") {
      params.delete("severity");
    } else if (value === "vulnerabilities") {
      params.delete("riskLevel");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFindingsChipClick = (targetTab: FindingsTab) => {
    if (targetTab !== currentTab) {
      handleTabChange(targetTab);
    }

    const scheduleScroll =
      typeof window !== "undefined" && window.requestAnimationFrame
        ? window.requestAnimationFrame
        : (callback: FrameRequestCallback) => callback(0);

    scheduleScroll(() => {
      document
        .getElementById(FINDINGS_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (isLoading) {
    return <AssetDetailsSkeleton />;
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-12 text-center">
        <AlertCircle className="mb-4 size-10 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Error loading asset</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "The asset could not be found or there was a network error."}
        </p>
        <div className="flex gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to list
          </Link>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const shouldCollapseComponentsByDefault =
    asset.components.length >= COMPONENT_COLLAPSE_THRESHOLD;
  const defaultOpenComponentIds = shouldCollapseComponentsByDefault
    ? []
    : asset.components.map((component) => component.id);
  const threatTotalsByComponent = new Map<string, number>();
  for (const page of threatsSummaryData?.pages ?? []) {
    for (const threat of page.data) {
      threatTotalsByComponent.set(
        threat.componentId,
        (threatTotalsByComponent.get(threat.componentId) ?? 0) + 1,
      );
    }
  }
  const vulnerabilityTotalsByComponent = new Map<string, number>();
  for (const page of vulnerabilitiesSummaryData?.pages ?? []) {
    for (const vulnerability of page.data) {
      vulnerabilityTotalsByComponent.set(
        vulnerability.componentId,
        (vulnerabilityTotalsByComponent.get(vulnerability.componentId) ?? 0) +
          1,
      );
    }
  }
  const totalThreats =
    threatsSummaryData?.pages[0]?.pagination.total ??
    asset.threatCounts?.total ??
    0;
  const totalVulnerabilities =
    vulnerabilitiesSummaryData?.pages[0]?.pagination.total ??
    asset.vulnerabilityCounts?.total ??
    0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Assets
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
          {asset.name}
        </span>
      </nav>

      <div className="space-y-8 rounded-xl border border-border/70 bg-card/40 p-6 sm:p-8">
        <header className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {asset.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {asset.description}
            </p>
          </div>

          {(asset.hasVulnerabilities || asset.hasThreats) && (
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">Risk indicators</legend>
              {asset.hasThreats && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={THREAT_CHIP_STYLE}
                >
                  Threats detected
                </span>
              )}
              {asset.hasVulnerabilities && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={VULNERABILITY_CHIP_STYLE}
                >
                  Vulnerabilities detected
                </span>
              )}
            </fieldset>
          )}
        </header>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-background/50 p-4 border border-border/40">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Created
            </dt>
            <dd className="text-sm font-medium">
              {formatAssetDate(asset.createdAt)}
            </dd>
          </div>
          <div className="rounded-lg bg-background/50 p-4 border border-border/40">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Last Scan
            </dt>
            <dd className="text-sm font-medium">
              {formatAssetDate(asset.lastScan)}
            </dd>
          </div>
        </dl>

        <section className="space-y-4 pt-4 border-t border-border/40">
          <h2 className="text-xl font-semibold tracking-tight">Components</h2>
          {asset.components.length === 0 ? (
            <p className="text-sm text-muted-foreground italic p-6 rounded-lg border border-dashed border-border/50 bg-background/20">
              No components detected for this asset.
            </p>
          ) : (
            <>
              {shouldCollapseComponentsByDefault && (
                <p className="text-xs text-muted-foreground">
                  Component details are collapsed by default for easier
                  scanning.
                </p>
              )}
              <Accordion
                multiple
                defaultValue={defaultOpenComponentIds}
                className="grid gap-3"
              >
                {asset.components.map((component) => (
                  <AccordionItem
                    key={component.id}
                    id={`component-${component.id}`}
                    value={component.id}
                    className="rounded-lg border border-border/70 bg-background/30 px-4 transition-colors hover:border-primary/40"
                  >
                    {(() => {
                      const componentThreatCount =
                        component.threatCounts?.total ??
                        threatTotalsByComponent.get(component.id) ??
                        0;
                      const componentVulnerabilityCount =
                        component.vulnerabilityCounts?.total ??
                        vulnerabilityTotalsByComponent.get(component.id) ??
                        0;
                      const hasThreats =
                        component.hasThreats ?? componentThreatCount > 0;
                      const hasVulnerabilities =
                        component.hasVulnerabilities ??
                        componentVulnerabilityCount > 0;
                      const isHealthy = !hasThreats && !hasVulnerabilities;

                      return (
                        <>
                          <AccordionHeader className="flex flex-wrap items-center gap-2 py-3">
                            <AccordionTrigger className="min-w-0 flex-1 gap-2 py-0 justify-start">
                              <div className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-foreground">
                                  {component.name}
                                </span>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {component.vendor} • Version{" "}
                                  {component.version}
                                </p>
                              </div>
                              <ChevronDown
                                className="size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180"
                                aria-hidden="true"
                              />
                            </AccordionTrigger>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {hasThreats && (
                                <button
                                  type="button"
                                  title="Go to Threats details below"
                                  onClick={() =>
                                    handleFindingsChipClick("threats")
                                  }
                                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  style={THREAT_CHIP_STYLE}
                                >
                                  Threats {componentThreatCount}
                                </button>
                              )}
                              {hasVulnerabilities && (
                                <button
                                  type="button"
                                  title="Go to Vulnerabilities details below"
                                  onClick={() =>
                                    handleFindingsChipClick("vulnerabilities")
                                  }
                                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  style={VULNERABILITY_CHIP_STYLE}
                                >
                                  Vulnerabilities {componentVulnerabilityCount}
                                </button>
                              )}
                              {isHealthy && (
                                <button
                                  type="button"
                                  title="No threats or vulnerabilities found for this component in the latest scan"
                                  className="inline-flex cursor-help items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  Healthy
                                </button>
                              )}
                              <span className="inline-flex items-center gap-2 rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground/70">
                                {component.type}
                              </span>
                            </div>
                          </AccordionHeader>

                          <AccordionContent className="pb-4">
                            <dl className="grid gap-3 border-t border-border/40 pt-4 text-xs sm:grid-cols-2">
                              <div className="rounded-md bg-background/60 p-2.5">
                                <dt className="text-muted-foreground uppercase tracking-wide text-[10px]">
                                  Vendor
                                </dt>
                                <dd className="mt-1 text-foreground font-medium">
                                  {component.vendor}
                                </dd>
                              </div>
                              <div className="rounded-md bg-background/60 p-2.5">
                                <dt className="text-muted-foreground uppercase tracking-wide text-[10px]">
                                  Version
                                </dt>
                                <dd className="mt-1 text-foreground font-medium">
                                  {component.version}
                                </dd>
                              </div>
                              <div className="rounded-md bg-background/60 p-2.5">
                                <dt className="text-muted-foreground uppercase tracking-wide text-[10px]">
                                  First Seen
                                </dt>
                                <dd className="mt-1 text-foreground font-medium">
                                  {formatAssetDate(component.createdAt)}
                                </dd>
                              </div>
                              <div className="rounded-md bg-background/60 p-2.5">
                                <dt className="text-muted-foreground uppercase tracking-wide text-[10px]">
                                  Last Scan
                                </dt>
                                <dd className="mt-1 text-foreground font-medium">
                                  {formatAssetDate(component.lastScan)}
                                </dd>
                              </div>
                            </dl>
                          </AccordionContent>
                        </>
                      );
                    })()}
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </section>

        <div
          id={FINDINGS_SECTION_ID}
          className="pt-6 border-t border-border/40 scroll-mt-24"
        >
          <Tabs
            defaultValue="threats"
            value={currentTab}
            onValueChange={(value) => handleTabChange(value as FindingsTab)}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger
                value="threats"
                className={FINDINGS_TAB_CLASSNAME}
                style={getFindingTabStyle(
                  currentTab === "threats",
                  THREAT_COLOR,
                )}
              >
                <ShieldAlert className="size-3.5" />
                Threats ({totalThreats})
              </TabsTrigger>
              <TabsTrigger
                value="vulnerabilities"
                className={FINDINGS_TAB_CLASSNAME}
                style={getFindingTabStyle(
                  currentTab === "vulnerabilities",
                  VULNERABILITY_COLOR,
                )}
              >
                <Bug className="size-3.5" />
                Vulnerabilities ({totalVulnerabilities})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="threats" className="mt-6">
              <AssetThreats assetId={asset.id} />
            </TabsContent>
            <TabsContent value="vulnerabilities" className="mt-6">
              <AssetVulnerabilities assetId={asset.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
