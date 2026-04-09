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
import { formatAssetDate } from "@/features/assets/format-asset-date";
import { useAssetQuery } from "@/features/assets/use-asset-query";
import { cn } from "@/lib/utils";

type AssetDetailsProps = {
  id: string;
};

const COMPONENT_COLLAPSE_THRESHOLD = 6;

export function AssetDetails({ id }: AssetDetailsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: asset, isLoading, error, refetch } = useAssetQuery(id);

  const currentTab = searchParams.get("tab") || "threats";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    // Limpiar filtros específicos de la pestaña anterior para evitar confusión
    if (value === "threats") {
      params.delete("severity");
    } else if (value === "vulnerabilities") {
      params.delete("riskLevel");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
              {asset.hasVulnerabilities && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    color: "#d89614",
                    borderColor: "#d89614",
                    backgroundColor: "rgb(216 150 20 / 0.1)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Vulnerabilities detected
                </span>
              )}
              {asset.hasThreats && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    color: "#d89614",
                    borderColor: "#d89614",
                    backgroundColor: "rgb(216 150 20 / 0.1)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Threats detected
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
                    <AccordionHeader>
                      <AccordionTrigger className="py-3">
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-foreground">
                            {component.name}
                          </span>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {component.vendor} • Version {component.version}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/70 bg-muted/30 px-1.5 py-0.5 rounded">
                          {component.type}
                          <ChevronDown
                            className="size-3.5 transition-transform group-aria-expanded:rotate-180"
                            aria-hidden="true"
                          />
                        </span>
                      </AccordionTrigger>
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
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </section>

        <div className="pt-6 border-t border-border/40">
          <Tabs
            defaultValue="threats"
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="threats" className="gap-2">
                <ShieldAlert className="size-3.5" />
                Threats
              </TabsTrigger>
              <TabsTrigger value="vulnerabilities" className="gap-2">
                <Bug className="size-3.5" />
                Vulnerabilities
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
