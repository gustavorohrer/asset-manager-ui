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
