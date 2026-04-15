import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Asset } from "@/domain/assets";
import { TopRiskyAssetsInsight } from "@/features/assets/insights/top-risky-assets-insight";

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

describe("TopRiskyAssetsInsight", () => {
  it("renders insight when at least two risky assets are present", () => {
    const assets = [
      createAsset("a1", "Asset One", { threatTotal: 2 }),
      createAsset("a2", "Asset Two", { vulnerabilityTotal: 3 }),
      createAsset("a3", "Asset Three"),
    ];

    render(<TopRiskyAssetsInsight assets={assets} />);

    expect(
      screen.getByText("Top risky assets (current page)"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Asset One" })).toHaveAttribute(
      "href",
      "/assets/a1",
    );
    expect(screen.getByRole("link", { name: "Asset Two" })).toHaveAttribute(
      "href",
      "/assets/a2",
    );
    expect(screen.getByText("Score 100/100")).toBeInTheDocument();
    expect(screen.getByText("Score 0/100")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("does not render insight when fewer than two risky assets are present", () => {
    const assets = [
      createAsset("a1", "Asset One", { threatTotal: 1 }),
      createAsset("a2", "Asset Two"),
    ];

    const { container } = render(<TopRiskyAssetsInsight assets={assets} />);

    expect(
      screen.queryByText("Top risky assets (current page)"),
    ).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
