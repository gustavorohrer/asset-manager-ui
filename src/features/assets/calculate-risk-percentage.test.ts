import { describe, expect, it } from "vitest";

import { calculateRiskPercentage } from "@/features/assets/calculate-risk-percentage";

describe("calculateRiskPercentage", () => {
  it("returns rounded percentage for valid count and total", () => {
    expect(calculateRiskPercentage(26, 41)).toBe(63);
  });

  it("returns 0 when total is zero", () => {
    expect(calculateRiskPercentage(5, 0)).toBe(0);
  });

  it("clamps values above 100", () => {
    expect(calculateRiskPercentage(120, 100)).toBe(100);
  });

  it("clamps values below 0", () => {
    expect(calculateRiskPercentage(-10, 100)).toBe(0);
  });

  it("handles normal rounded values consistently", () => {
    expect(calculateRiskPercentage(1, 3)).toBe(33);
    expect(calculateRiskPercentage(2, 3)).toBe(67);
  });
});
