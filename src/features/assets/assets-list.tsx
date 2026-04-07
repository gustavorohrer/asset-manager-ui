"use client";

import { useState } from "react";

import { filterAssets } from "@/features/assets/filter-assets";
import { useAssetsQuery } from "@/features/assets/use-assets-query";

export function AssetsList() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredAssets = filterAssets(data.data, searchQuery);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Search assets
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or description"
          className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
      </label>

      {filteredAssets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No assets match your search
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredAssets.map((asset) => (
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
      )}
    </section>
  );
}
