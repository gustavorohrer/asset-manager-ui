import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAsset, getAssetsSummary } from "@/api/assets";

const fetchMock = vi.fn();

describe("getAsset", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns parsed asset details when API response is valid", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "AST-001",
          name: "Dell PowerEdge R740 Server",
          description: "Production database server in datacenter rack A3",
          createdAt: "2024-01-15T00:00:00.000Z",
          lastScan: "2024-10-08T00:00:00.000Z",
          hasVulnerabilities: true,
          hasThreats: false,
          components: [
            {
              id: "CMP-001",
              name: "Dell UEFI BIOS",
              version: "2.10.2",
              vendor: "Dell Inc.",
              type: "UEFI",
              createdAt: "2024-01-15T00:00:00.000Z",
              lastScan: null,
              assetId: "AST-001",
            },
          ],
        },
      }),
    });

    const result = await getAsset("AST-001");

    expect(result.id).toBe("AST-001");
    expect(result.components).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/assets/AST-001",
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
  });

  it("throws when API responds with non-ok status", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getAsset("AST-404")).rejects.toThrow(
      "Failed to fetch asset AST-404: 404",
    );
  });

  it("throws when payload does not match the expected schema", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "AST-001",
          name: "Dell PowerEdge R740 Server",
          description: "Production database server in datacenter rack A3",
          createdAt: "2024-01-15T00:00:00.000Z",
          lastScan: null,
          hasVulnerabilities: true,
          hasThreats: true,
          components: [
            {
              id: "CMP-001",
              name: "Dell UEFI BIOS",
            },
          ],
        },
      }),
    });

    await expect(getAsset("AST-001")).rejects.toThrow();
  });
});

describe("getAssetsSummary", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns parsed summary when API response is valid", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 41,
        withVulnerabilities: 26,
        withThreats: 26,
      }),
    });

    const result = await getAssetsSummary();

    expect(result).toEqual({
      total: 41,
      withVulnerabilities: 26,
      withThreats: 26,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/assets/summary",
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
  });

  it("throws when API responds with non-ok status", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getAssetsSummary()).rejects.toThrow(
      "Failed to fetch asset summary: 500",
    );
  });

  it("throws when payload does not match the expected schema", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 41,
        withVulnerabilities: "26",
        withThreats: 26,
      }),
    });

    await expect(getAssetsSummary()).rejects.toThrow();
  });
});
