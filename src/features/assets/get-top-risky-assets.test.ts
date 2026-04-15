import { describe, expect, it } from "vitest";

import type { Asset } from "@/domain/assets";
import { getTopRiskyAssets } from "@/features/assets/insights/get-top-risky-assets";

const FIXED_NOW = new Date("2026-02-01T00:00:00.000Z");

function createAsset(
  id: string,
  name: string,
  {
    threatHigh = 0,
    threatMedium = 0,
    threatLow = 0,
    threatTotal,
    vulnerabilityHigh = 0,
    vulnerabilityMedium = 0,
    vulnerabilityTotal,
    lastScan = null,
  }: {
    threatHigh?: number;
    threatMedium?: number;
    threatLow?: number;
    threatTotal?: number;
    vulnerabilityHigh?: number;
    vulnerabilityMedium?: number;
    vulnerabilityTotal?: number;
    lastScan?: string | null;
  } = {},
): Asset {
  const resolvedThreatTotal =
    threatTotal ?? threatHigh + threatMedium + threatLow;
  const resolvedVulnerabilityTotal =
    vulnerabilityTotal ?? vulnerabilityHigh + vulnerabilityMedium;

  return {
    id,
    name,
    description: `${name} description`,
    createdAt: "2026-01-01T00:00:00.000Z",
    lastScan,
    hasThreats: resolvedThreatTotal > 0,
    hasVulnerabilities: resolvedVulnerabilityTotal > 0,
    threatCounts: {
      high: threatHigh,
      medium: threatMedium,
      low: threatLow,
      total: resolvedThreatTotal,
    },
    vulnerabilityCounts: {
      high: vulnerabilityHigh,
      medium: vulnerabilityMedium,
      total: resolvedVulnerabilityTotal,
    },
  };
}

describe("getTopRiskyAssets", () => {
  it("ranks assets using weighted severity score", () => {
    const assets = [
      createAsset("a1", "A", { threatLow: 4 }),
      createAsset("a2", "B", { vulnerabilityHigh: 1 }),
      createAsset("a3", "C", { threatHigh: 1 }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a3", "a1"]);
  });

  it("normalizes score to a 0-100 range", () => {
    const assets = [
      createAsset("a1", "Low", { threatLow: 1 }),
      createAsset("a2", "Medium", { threatLow: 4 }),
      createAsset("a3", "High", { threatHigh: 1, threatLow: 1 }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "a1", riskScore: 0 }),
        expect.objectContaining({ id: "a2", riskScore: 50 }),
        expect.objectContaining({ id: "a3", riskScore: 100 }),
      ]),
    );
  });

  it("assigns High/Medium/Low levels from normalized score", () => {
    const assets = [
      createAsset("a1", "Low", { threatLow: 1 }),
      createAsset("a2", "Medium", { threatLow: 4 }),
      createAsset("a3", "High", { threatHigh: 1, threatLow: 1 }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "a1", riskLevel: "Low" }),
        expect.objectContaining({ id: "a2", riskLevel: "Medium" }),
        expect.objectContaining({ id: "a3", riskLevel: "High" }),
      ]),
    );
  });

  it("gives all risky assets score 100 when raw score is identical", () => {
    const assets = [
      createAsset("a1", "Asset A", { threatMedium: 1 }),
      createAsset("a2", "Asset B", { threatMedium: 1 }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result.map((asset) => asset.riskScore)).toEqual([100, 100]);
  });

  it("applies recency bonus only when findings exist", () => {
    const assets = [
      createAsset("a1", "Healthy", {
        lastScan: "2026-01-30T00:00:00.000Z",
      }),
      createAsset("a2", "Old Risk", {
        threatLow: 2,
        lastScan: "2026-01-01T00:00:00.000Z",
      }),
      createAsset("a3", "Fresh Risk", {
        threatLow: 2,
        lastScan: "2026-01-29T00:00:00.000Z",
      }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result.map((asset) => asset.id)).toEqual(["a3", "a2"]);
    expect(result.find((asset) => asset.id === "a1")).toBeUndefined();
  });

  it("breaks score ties by most recent lastScan", () => {
    const assets = [
      createAsset("a1", "Zulu", {
        threatLow: 2,
        lastScan: "2025-12-01T00:00:00.000Z",
      }),
      createAsset("a2", "Alpha", {
        threatLow: 2,
        lastScan: "2025-12-15T00:00:00.000Z",
      }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a1"]);
  });

  it("breaks remaining ties by name ascending", () => {
    const assets = [
      createAsset("a1", "Zulu", {
        threatLow: 2,
        lastScan: "2025-12-01T00:00:00.000Z",
      }),
      createAsset("a2", "Alpha", {
        threatLow: 2,
        lastScan: "2025-12-01T00:00:00.000Z",
      }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a1"]);
  });

  it("limits output to top three assets", () => {
    const assets = [
      createAsset("a1", "Asset 1", { threatLow: 1 }),
      createAsset("a2", "Asset 2", { threatLow: 2 }),
      createAsset("a3", "Asset 3", { threatLow: 3 }),
      createAsset("a4", "Asset 4", { threatLow: 4 }),
    ];

    const result = getTopRiskyAssets(assets, { now: FIXED_NOW });

    expect(result).toHaveLength(3);
    expect(result.map((asset) => asset.id)).toEqual(["a4", "a3", "a2"]);
  });
});
