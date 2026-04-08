"use client";

import { AlertCircle, ChevronRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AssetDetailsSkeleton } from "@/features/assets/asset-details-skeleton";
import { formatAssetDate } from "@/features/assets/format-asset-date";
import { useAssetQuery } from "@/features/assets/use-asset-query";
import { cn } from "@/lib/utils";

type AssetDetailsProps = {
  id: string;
};

export function AssetDetails({ id }: AssetDetailsProps) {
  const { data: asset, isLoading, error, refetch } = useAssetQuery(id);

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
                    color: "#e84749",
                    borderColor: "#e84749",
                    backgroundColor: "rgb(232 71 73 / 0.1)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Compromised
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
            <ul className="grid gap-3">
              {asset.components.map((component) => (
                <li
                  key={component.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/30 p-4 hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {component.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {component.vendor} • Version {component.version}
                    </p>
                  </div>
                  <div className="text-left flex flex-col sm:items-end">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/70 bg-muted/30 px-1.5 py-0.5 rounded">
                      {component.type}
                    </span>
                    <span className="text-xs text-muted-foreground mt-2">
                      Scanned: {formatAssetDate(component.lastScan)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
