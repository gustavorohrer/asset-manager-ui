import { render, screen } from "@testing-library/react";

import { AssetItem } from "@/features/assets/asset-item";

const baseAsset = {
  id: "asset-1",
  name: "Web Gateway",
  description: "Edge traffic handler",
  createdAt: "2026-01-12T10:00:00.000Z",
  lastScan: "2026-01-15T10:00:00.000Z",
  hasVulnerabilities: false,
  hasThreats: false,
  threatCounts: {
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  },
  vulnerabilityCounts: {
    high: 0,
    medium: 0,
    total: 0,
  },
};

describe("AssetItem", () => {
  it("renders vulnerability row counters when vulnerability counters are present", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasVulnerabilities: true,
          vulnerabilityCounts: {
            high: 5,
            medium: 10,
            total: 18,
          },
        }}
      />,
    );

    expect(screen.getByText("Vulnerabilities")).toBeInTheDocument();
    expect(screen.getByText("High: 5")).toBeInTheDocument();
    expect(screen.getByText("Med: 10")).toBeInTheDocument();
    expect(screen.getByText("Other: 3")).toBeInTheDocument();
    expect(
      screen.queryByText("Vulnerabilities detected"),
    ).not.toBeInTheDocument();
  });

  it("renders fallback vulnerabilities badge when asset has vulnerabilities but no counters", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasVulnerabilities: true,
        }}
      />,
    );

    expect(screen.getByText("Vulnerabilities")).toBeInTheDocument();
    expect(screen.getByText("Vulnerabilities detected")).toBeInTheDocument();
    expect(screen.queryByText("High:")).not.toBeInTheDocument();
    expect(screen.queryByText("Med:")).not.toBeInTheDocument();
    expect(screen.queryByText("Other:")).not.toBeInTheDocument();
  });

  it("renders threat row counters when threat counters are present", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasThreats: true,
          threatCounts: {
            high: 2,
            medium: 3,
            low: 1,
            total: 6,
          },
        }}
      />,
    );

    expect(screen.getByText("Threats")).toBeInTheDocument();
    expect(screen.getByText("High: 2")).toBeInTheDocument();
    expect(screen.getByText("Med: 3")).toBeInTheDocument();
    expect(screen.getByText("Low: 1")).toBeInTheDocument();
    expect(screen.queryByText("Threats detected")).not.toBeInTheDocument();
  });

  it("renders fallback threats badge when asset has threats but no counters", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasThreats: true,
        }}
      />,
    );

    expect(screen.getByText("Threats")).toBeInTheDocument();
    expect(screen.getByText("Threats detected")).toBeInTheDocument();
    expect(screen.queryByText("High:")).not.toBeInTheDocument();
    expect(screen.queryByText("Med:")).not.toBeInTheDocument();
    expect(screen.queryByText("Low:")).not.toBeInTheDocument();
  });

  it("does not render risk indicators when asset has no risks", () => {
    render(<AssetItem asset={baseAsset} />);

    expect(
      screen.queryByRole("group", { name: "Risk indicators" }),
    ).not.toBeInTheDocument();
  });
});
