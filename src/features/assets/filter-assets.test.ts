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
});
