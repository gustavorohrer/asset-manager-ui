import Link from "next/link";
import type { Asset } from "@/domain/assets";
import { formatAssetDate } from "@/features/assets/format-asset-date";

type AssetItemProps = {
  asset: Asset;
};

export function AssetItem({ asset }: AssetItemProps) {
  return (
    <li className="group relative rounded-lg border border-border/70 bg-card/70 transition-all duration-200 hover:border-primary/50 hover:bg-card/90">
      <Link
        href={`/assets/${asset.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${asset.name}`}
      />
      <div className="p-4">
        <h2 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {asset.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {asset.description}
        </p>

        {(asset.hasVulnerabilities || asset.hasThreats) && (
          <fieldset className="relative z-20 mt-3 flex flex-wrap gap-2 pointer-events-none">
            <legend className="sr-only">Risk indicators</legend>
            {asset.hasVulnerabilities && (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: "#d89614",
                  borderColor: "#d89614",
                  backgroundColor: "rgb(216 150 20 / 0.1)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                Vulnerabilities
              </span>
            )}

            {asset.hasThreats && (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: "#e84749",
                  borderColor: "#e84749",
                  backgroundColor: "rgb(232 71 73 / 0.1)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                Compromised
              </span>
            )}
          </fieldset>
        )}

        <dl className="mt-4 grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-2">
          <div className="rounded-md bg-background/70 p-2 border border-border/10">
            <dt className="text-muted-foreground uppercase tracking-tight">Created</dt>
            <dd className="mt-0.5 text-foreground font-medium">
              {formatAssetDate(asset.createdAt)}
            </dd>
          </div>
          <div className="rounded-md bg-background/70 p-2 border border-border/10">
            <dt className="text-muted-foreground uppercase tracking-tight">Last scan</dt>
            <dd className="mt-0.5 text-foreground font-medium">
              {formatAssetDate(asset.lastScan)}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
