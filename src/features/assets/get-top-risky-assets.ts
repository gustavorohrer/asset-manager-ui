import type { Asset } from "@/domain/assets";

export type TopRiskyAsset = {
  id: string;
  name: string;
  riskScore: number;
  threatCount: number;
  vulnerabilityCount: number;
  lastScan: string | null;
};

const TOP_RISKY_ASSETS_LIMIT = 3;

function toTimestamp(lastScan: string | null): number {
  if (!lastScan) {
    return Number.NEGATIVE_INFINITY;
  }

  const date = new Date(lastScan);
  return Number.isNaN(date.getTime())
    ? Number.NEGATIVE_INFINITY
    : date.getTime();
}

function compareByName(leftName: string, rightName: string): number {
  return leftName.localeCompare(rightName, "en-US", { sensitivity: "base" });
}

export function getTopRiskyAssets(assets: Asset[]): TopRiskyAsset[] {
  return assets
    .map((asset) => {
      const threatCount = asset.threatCounts?.total ?? 0;
      const vulnerabilityCount = asset.vulnerabilityCounts?.total ?? 0;

      return {
        id: asset.id,
        name: asset.name,
        riskScore: threatCount + vulnerabilityCount,
        threatCount,
        vulnerabilityCount,
        lastScan: asset.lastScan,
      } satisfies TopRiskyAsset;
    })
    .filter((asset) => asset.riskScore > 0)
    .sort((leftAsset, rightAsset) => {
      if (rightAsset.riskScore !== leftAsset.riskScore) {
        return rightAsset.riskScore - leftAsset.riskScore;
      }

      const rightTimestamp = toTimestamp(rightAsset.lastScan);
      const leftTimestamp = toTimestamp(leftAsset.lastScan);

      if (rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return compareByName(leftAsset.name, rightAsset.name);
    })
    .slice(0, TOP_RISKY_ASSETS_LIMIT);
}
