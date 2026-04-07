import type { Asset } from "@/domain/assets";

export function filterAssets(assets: Asset[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return assets;
  }

  return assets.filter((asset) => {
    const normalizedName = asset.name.toLowerCase();
    const normalizedDescription = asset.description?.toLowerCase() ?? "";

    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedDescription.includes(normalizedQuery)
    );
  });
}
