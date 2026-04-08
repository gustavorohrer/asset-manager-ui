import type { Asset } from "@/domain/assets";
import { formatAssetDate } from "@/features/assets/format-asset-date";

type AssetItemProps = {
  asset: Asset;
};

export function AssetItem({ asset }: AssetItemProps) {
  return (
    <li className="rounded-lg border border-border/70 bg-card/70 p-4">
      <p className="text-base font-medium text-foreground">{asset.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{asset.description}</p>

      {(asset.hasVulnerabilities || asset.hasThreats) && (
        <fieldset className="mt-3 flex flex-wrap gap-2">
          <legend className="sr-only">Risk indicators</legend>
          {asset.hasVulnerabilities && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{
                color: "#d89614",
                borderColor: "#d89614",
                backgroundColor: "rgb(216 150 20 / 0.1)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              Vulnerabilities
            </span>
          )}

          {asset.hasThreats && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{
                color: "#e84749",
                borderColor: "#e84749",
                backgroundColor: "rgb(232 71 73 / 0.1)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              Compromised
            </span>
          )}
        </fieldset>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-md bg-background/70 p-2">
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1 text-foreground">
            {formatAssetDate(asset.createdAt)}
          </dd>
        </div>
        <div className="rounded-md bg-background/70 p-2">
          <dt className="text-muted-foreground">Last scan</dt>
          <dd className="mt-1 text-foreground">
            {formatAssetDate(asset.lastScan)}
          </dd>
        </div>
      </dl>
    </li>
  );
}
