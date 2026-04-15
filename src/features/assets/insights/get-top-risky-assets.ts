import type { Asset } from "@/domain/assets";

export type RiskLevel = "High" | "Medium" | "Low";

export type TopRiskyAsset = {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: RiskLevel;
  threatCount: number;
  vulnerabilityCount: number;
  lastScan: string | null;
};

const TOP_RISKY_ASSETS_LIMIT = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_SCAN_DAYS = 7;
const STALE_SCAN_DAYS = 30;

const RISK_WEIGHTS = {
  threatHigh: 6,
  threatMedium: 3,
  threatLow: 1,
  threatUnknown: 1,
  vulnerabilityHigh: 8,
  vulnerabilityMedium: 5,
  vulnerabilityUnknown: 2,
  recencyRecent: 3,
  recencyStale: 1,
} as const;

type ScoredAsset = TopRiskyAsset & {
  rawRiskScore: number;
};

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

function getRecencyBonus(
  lastScan: string | null,
  nowTimestamp: number,
): number {
  const scanTimestamp = toTimestamp(lastScan);
  if (!Number.isFinite(scanTimestamp)) {
    return 0;
  }

  const elapsedMs = nowTimestamp - scanTimestamp;
  if (elapsedMs <= RECENT_SCAN_DAYS * DAY_IN_MS) {
    return RISK_WEIGHTS.recencyRecent;
  }

  if (elapsedMs <= STALE_SCAN_DAYS * DAY_IN_MS) {
    return RISK_WEIGHTS.recencyStale;
  }

  return 0;
}

function getRawRiskScore(asset: Asset, nowTimestamp: number): number {
  const threatCounts = asset.threatCounts;
  const vulnerabilityCounts = asset.vulnerabilityCounts;

  const threatHigh = threatCounts?.high ?? 0;
  const threatMedium = threatCounts?.medium ?? 0;
  const threatLow = threatCounts?.low ?? 0;
  const threatTotal = threatCounts?.total ?? 0;

  const vulnerabilityHigh = vulnerabilityCounts?.high ?? 0;
  const vulnerabilityMedium = vulnerabilityCounts?.medium ?? 0;
  const vulnerabilityTotal = vulnerabilityCounts?.total ?? 0;

  const threatUnknown = Math.max(
    threatTotal - threatHigh - threatMedium - threatLow,
    0,
  );
  const vulnerabilityUnknown = Math.max(
    vulnerabilityTotal - vulnerabilityHigh - vulnerabilityMedium,
    0,
  );

  const weightedFindingsScore =
    threatHigh * RISK_WEIGHTS.threatHigh +
    threatMedium * RISK_WEIGHTS.threatMedium +
    threatLow * RISK_WEIGHTS.threatLow +
    threatUnknown * RISK_WEIGHTS.threatUnknown +
    vulnerabilityHigh * RISK_WEIGHTS.vulnerabilityHigh +
    vulnerabilityMedium * RISK_WEIGHTS.vulnerabilityMedium +
    vulnerabilityUnknown * RISK_WEIGHTS.vulnerabilityUnknown;

  if (weightedFindingsScore === 0) {
    return 0;
  }

  return weightedFindingsScore + getRecencyBonus(asset.lastScan, nowTimestamp);
}

function normalizeRiskScore(
  rawRiskScore: number,
  minRawRiskScore: number,
  maxRawRiskScore: number,
): number {
  if (maxRawRiskScore === minRawRiskScore) {
    return 100;
  }

  return Math.round(
    ((rawRiskScore - minRawRiskScore) / (maxRawRiskScore - minRawRiskScore)) *
      100,
  );
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 67) {
    return "High";
  }

  if (score >= 34) {
    return "Medium";
  }

  return "Low";
}

type GetTopRiskyAssetsOptions = {
  now?: Date;
};

export function getTopRiskyAssets(
  assets: Asset[],
  options: GetTopRiskyAssetsOptions = {},
): TopRiskyAsset[] {
  const nowTimestamp = (options.now ?? new Date()).getTime();

  const scoredAssets = assets
    .map((asset) => {
      const threatCount = asset.threatCounts?.total ?? 0;
      const vulnerabilityCount = asset.vulnerabilityCounts?.total ?? 0;
      const rawRiskScore = getRawRiskScore(asset, nowTimestamp);

      return {
        id: asset.id,
        name: asset.name,
        riskScore: 0,
        riskLevel: "Low",
        threatCount,
        vulnerabilityCount,
        lastScan: asset.lastScan,
        rawRiskScore,
      } satisfies ScoredAsset;
    })
    .filter((asset) => asset.rawRiskScore > 0);

  if (scoredAssets.length === 0) {
    return [];
  }

  const rawRiskScores = scoredAssets.map((asset) => asset.rawRiskScore);
  const minRawRiskScore = Math.min(...rawRiskScores);
  const maxRawRiskScore = Math.max(...rawRiskScores);

  return scoredAssets
    .map((asset) => {
      const riskScore = normalizeRiskScore(
        asset.rawRiskScore,
        minRawRiskScore,
        maxRawRiskScore,
      );

      return {
        id: asset.id,
        name: asset.name,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        threatCount: asset.threatCount,
        vulnerabilityCount: asset.vulnerabilityCount,
        lastScan: asset.lastScan,
        rawRiskScore: asset.rawRiskScore,
      } satisfies ScoredAsset;
    })
    .sort((leftAsset, rightAsset) => {
      if (rightAsset.riskScore !== leftAsset.riskScore) {
        return rightAsset.riskScore - leftAsset.riskScore;
      }

      if (rightAsset.rawRiskScore !== leftAsset.rawRiskScore) {
        return rightAsset.rawRiskScore - leftAsset.rawRiskScore;
      }

      const rightTimestamp = toTimestamp(rightAsset.lastScan);
      const leftTimestamp = toTimestamp(leftAsset.lastScan);

      if (rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return compareByName(leftAsset.name, rightAsset.name);
    })
    .slice(0, TOP_RISKY_ASSETS_LIMIT)
    .map(({ rawRiskScore: _rawRiskScore, ...asset }) => asset);
}
