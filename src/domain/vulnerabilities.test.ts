import { describe, expect, it } from "vitest";
import { listAssetVulnerabilitiesResponseSchema } from "./vulnerabilities";

describe("vulnerabilities domain", () => {
  it("parses a valid response", () => {
    const validResponse = {
      data: [
        {
          id: "v1",
          description: "Vuln 1",
          severity: "HIGH",
          componentId: "c1",
          componentName: "Comp 1",
          performedAt: "2024-01-01T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    const result =
      listAssetVulnerabilitiesResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("fails on invalid severity", () => {
    const invalidResponse = {
      data: [
        {
          id: "v1",
          description: "Vuln 1",
          severity: "INVALID",
          componentId: "c1",
          componentName: "Comp 1",
          performedAt: "2024-01-01T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    const result =
      listAssetVulnerabilitiesResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});
