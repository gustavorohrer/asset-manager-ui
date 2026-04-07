"use client";

import { useAssetsQuery } from "@/features/assets/use-assets-query";

export function AssetsList() {
  const { data, error, isLoading } = useAssetsQuery();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading assets...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load assets. Please try again.
      </p>
    );
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No assets found.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>

      <ul className="space-y-2">
        {data.data.map((asset) => (
          <li
            key={asset.id}
            className="rounded-lg border border-border/70 bg-card/70 p-4 text-sm"
          >
            <p className="font-medium text-foreground">{asset.name}</p>
            <p className="mt-1 text-muted-foreground">{asset.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              ID: {asset.id} · Vulnerabilities:{" "}
              {asset.hasVulnerabilities ? "yes" : "no"} · Threats:{" "}
              {asset.hasThreats ? "yes" : "no"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
