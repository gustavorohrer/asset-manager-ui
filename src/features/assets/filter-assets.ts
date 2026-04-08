import type { Asset } from "@/domain/assets";

export type AssetRiskFilters = {
  withVulnerabilities: boolean;
  withThreats: boolean;
};

const defaultRiskFilters: AssetRiskFilters = {
  withVulnerabilities: false,
  withThreats: false,
};

export function filterAssets(
  assets: Asset[],
  query: string,
  riskFilters: AssetRiskFilters = defaultRiskFilters,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const { withVulnerabilities, withThreats } = riskFilters;

  if (!normalizedQuery && !withVulnerabilities && !withThreats) {
    return assets;
  }

  return assets.filter((asset) => {
    const normalizedName = asset.name.toLowerCase();
    const normalizedDescription = asset.description?.toLowerCase() ?? "";
    const matchesQuery =
      !normalizedQuery ||
      normalizedName.includes(normalizedQuery) ||
      normalizedDescription.includes(normalizedQuery);
    const matchesRiskFilters =
      (!withVulnerabilities || asset.hasVulnerabilities) &&
      (!withThreats || asset.hasThreats);

    return matchesQuery && matchesRiskFilters;
  });
}
