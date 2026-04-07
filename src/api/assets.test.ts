import { getAssets } from "@/api/assets";

describe("getAssets", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns validated assets from the API response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "asset-1",
              name: "Web Gateway",
              description: "External traffic ingress",
              createdAt: "2026-01-12T10:00:00.000Z",
              lastScan: null,
              hasVulnerabilities: false,
              hasThreats: true,
            },
          ],
          pagination: {
            page: 0,
            pageSize: 25,
            total: 1,
            totalPages: 1,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(getAssets()).resolves.toEqual([
      {
        id: "asset-1",
        name: "Web Gateway",
        description: "External traffic ingress",
        createdAt: "2026-01-12T10:00:00.000Z",
        lastScan: null,
        hasVulnerabilities: false,
        hasThreats: true,
      },
    ]);
  });

  it("throws a controlled error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));

    await expect(getAssets()).rejects.toThrow("Failed to fetch assets: 503");
  });

  it("throws when response payload does not match the schema", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "asset-1",
              description: "Missing required name",
              createdAt: "2026-01-12T10:00:00.000Z",
              lastScan: null,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(getAssets()).rejects.toThrow();
  });
});
