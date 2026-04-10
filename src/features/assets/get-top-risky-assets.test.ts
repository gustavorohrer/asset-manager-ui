import { describe, expect, it } from "vitest";

import type { Asset } from "@/domain/assets";
import { getTopRiskyAssets } from "@/features/assets/get-top-risky-assets";

function createAsset(
  id: string,
  name: string,
  {
    threatTotal = 0,
    vulnerabilityTotal = 0,
    lastScan = null,
  }: {
    threatTotal?: number;
    vulnerabilityTotal?: number;
    lastScan?: string | null;
  } = {},
): Asset {
  return {
    id,
    name,
    description: `${name} description`,
    createdAt: "2026-01-01T00:00:00.000Z",
    lastScan,
    hasThreats: threatTotal > 0,
    hasVulnerabilities: vulnerabilityTotal > 0,
    threatCounts: {
      high: 0,
      medium: 0,
      low: 0,
      total: threatTotal,
    },
    vulnerabilityCounts: {
      high: 0,
      medium: 0,
      total: vulnerabilityTotal,
    },
  };
}

describe("getTopRiskyAssets", () => {
  it("sorts assets by risk score descending", () => {
    const assets = [
      createAsset("a1", "A", { threatTotal: 1, vulnerabilityTotal: 1 }),
      createAsset("a2", "B", { threatTotal: 4, vulnerabilityTotal: 0 }),
      createAsset("a3", "C", { threatTotal: 1, vulnerabilityTotal: 0 }),
    ];

    const result = getTopRiskyAssets(assets);

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a1", "a3"]);
  });

  it("breaks score ties by most recent lastScan", () => {
    const assets = [
      createAsset("a1", "A", {
        threatTotal: 2,
        lastScan: "2026-01-01T00:00:00.000Z",
      }),
      createAsset("a2", "B", {
        threatTotal: 2,
        lastScan: "2026-01-03T00:00:00.000Z",
      }),
    ];

    const result = getTopRiskyAssets(assets);

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a1"]);
  });

  it("breaks remaining ties by name ascending", () => {
    const assets = [
      createAsset("a1", "Zulu", {
        threatTotal: 2,
        lastScan: "2026-01-01T00:00:00.000Z",
      }),
      createAsset("a2", "Alpha", {
        threatTotal: 2,
        lastScan: "2026-01-01T00:00:00.000Z",
      }),
    ];

    const result = getTopRiskyAssets(assets);

    expect(result.map((asset) => asset.id)).toEqual(["a2", "a1"]);
  });

  it("excludes assets with zero risk score", () => {
    const assets = [
      createAsset("a1", "Healthy Asset"),
      createAsset("a2", "Risky Asset", { vulnerabilityTotal: 1 }),
    ];

    const result = getTopRiskyAssets(assets);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("a2");
  });

  it("limits result to top three assets", () => {
    const assets = [
      createAsset("a1", "Asset 1", { threatTotal: 1 }),
      createAsset("a2", "Asset 2", { threatTotal: 2 }),
      createAsset("a3", "Asset 3", { threatTotal: 3 }),
      createAsset("a4", "Asset 4", { threatTotal: 4 }),
    ];

    const result = getTopRiskyAssets(assets);

    expect(result).toHaveLength(3);
    expect(result.map((asset) => asset.id)).toEqual(["a4", "a3", "a2"]);
  });
});
