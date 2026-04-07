import type { Asset } from "@/domain/assets";
import { AssetItem } from "@/features/assets/asset-item";

type AssetListProps = {
  assets: Asset[];
};

export function AssetList({ assets }: AssetListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {assets.map((asset) => (
        <AssetItem key={asset.id} asset={asset} />
      ))}
    </ul>
  );
}
