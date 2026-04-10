import { describe, expect, it } from "vitest";

import {
  getAsset,
  getAssets,
  getAssetsSummary,
  getAssetThreats,
  getAssetVulnerabilities,
} from "@/api/assets";

describe("assets API contract (live backend)", () => {
  it("validates list and summary contracts", async () => {
    const [assetsResponse, summary] = await Promise.all([
      getAssets(1, 20),
      getAssetsSummary(),
    ]);

    expect(Array.isArray(assetsResponse.data)).toBe(true);
    expect(assetsResponse.pagination.page).toBeGreaterThanOrEqual(1);
    expect(assetsResponse.pagination.pageSize).toBeGreaterThanOrEqual(1);

    expect(summary.total).toBeGreaterThanOrEqual(0);
    expect(summary.withThreats).toBeGreaterThanOrEqual(0);
    expect(summary.withVulnerabilities).toBeGreaterThanOrEqual(0);
  });

  it("validates detail, threats and vulnerabilities contracts when at least one asset exists", async () => {
    const assetsResponse = await getAssets(1, 20);
    const firstAsset = assetsResponse.data[0];

    if (!firstAsset) {
      expect(assetsResponse.pagination.total).toBe(0);
      return;
    }

    const [assetDetails, threatsResponse, vulnerabilitiesResponse] =
      await Promise.all([
        getAsset(firstAsset.id),
        getAssetThreats(firstAsset.id, 1, 10),
        getAssetVulnerabilities(firstAsset.id, 1, 10),
      ]);

    expect(assetDetails.id).toBe(firstAsset.id);
    expect(Array.isArray(assetDetails.components)).toBe(true);
    expect(Array.isArray(threatsResponse.data)).toBe(true);
    expect(Array.isArray(vulnerabilitiesResponse.data)).toBe(true);
  });
});
