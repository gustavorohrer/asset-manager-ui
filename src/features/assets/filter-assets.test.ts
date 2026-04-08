import { filterAssets } from "@/features/assets/filter-assets";

const assets = [
  {
    id: "1",
    name: "Database Server",
    description: "Primary PostgreSQL cluster",
    createdAt: "2026-01-10T10:00:00.000Z",
    lastScan: null,
    hasVulnerabilities: false,
    hasThreats: false,
  },
  {
    id: "2",
    name: "Web Gateway",
    description: "External traffic ingress",
    createdAt: "2026-01-12T10:00:00.000Z",
    lastScan: "2026-01-15T10:00:00.000Z",
    hasVulnerabilities: true,
    hasThreats: false,
  },
  {
    id: "3",
    name: "Queue Worker",
    description: "Consumes PostgreSQL events",
    createdAt: "2026-01-20T10:00:00.000Z",
    lastScan: "2026-01-25T10:00:00.000Z",
    hasVulnerabilities: false,
    hasThreats: true,
  },
];

describe("filterAssets", () => {
  it("returns all assets when query is empty or blank", () => {
    expect(filterAssets(assets, "")).toBe(assets);
    expect(filterAssets(assets, "   ")).toBe(assets);
  });

  it("returns all assets when risk filters are disabled", () => {
    const result = filterAssets(assets, "", {
      withVulnerabilities: false,
      withThreats: false,
    });

    expect(result).toBe(assets);
  });

  it("matches by name using case-insensitive search", () => {
    const result = filterAssets(assets, "gAtEwAy");

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });

  it("matches by description when name does not include the query", () => {
    const result = filterAssets(assets, "postgresql");

    expect(result).toHaveLength(2);
    expect(result.map((asset) => asset.id)).toEqual(["1", "3"]);
  });

  it("does not mutate the original assets array", () => {
    const original = structuredClone(assets);

    filterAssets(assets, "gateway");

    expect(assets).toEqual(original);
  });

  it("filters by vulnerabilities only", () => {
    const result = filterAssets(assets, "", {
      withVulnerabilities: true,
      withThreats: false,
    });

    expect(result.map((asset) => asset.id)).toEqual(["2"]);
  });

  it("filters by threats only", () => {
    const result = filterAssets(assets, "", {
      withVulnerabilities: false,
      withThreats: true,
    });

    expect(result.map((asset) => asset.id)).toEqual(["3"]);
  });

  it("applies AND logic when both risk filters are enabled", () => {
    const result = filterAssets(
      [
        ...assets,
        {
          id: "4",
          name: "API Proxy",
          description: "Public edge node",
          createdAt: "2026-01-22T10:00:00.000Z",
          lastScan: "2026-01-26T10:00:00.000Z",
          hasVulnerabilities: true,
          hasThreats: true,
        },
      ],
      "",
      {
        withVulnerabilities: true,
        withThreats: true,
      },
    );

    expect(result.map((asset) => asset.id)).toEqual(["4"]);
  });

  it("combines text and risk filters with AND logic", () => {
    const result = filterAssets(
      [
        ...assets,
        {
          id: "4",
          name: "Gateway Replica",
          description: "Secondary ingress gateway",
          createdAt: "2026-01-24T10:00:00.000Z",
          lastScan: "2026-01-28T10:00:00.000Z",
          hasVulnerabilities: true,
          hasThreats: false,
        },
      ],
      "gateway",
      {
        withVulnerabilities: true,
        withThreats: false,
      },
    );

    expect(result.map((asset) => asset.id)).toEqual(["2", "4"]);
  });
});
