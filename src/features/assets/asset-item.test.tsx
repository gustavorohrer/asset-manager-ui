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
};

describe("AssetItem", () => {
  it("renders vulnerabilities badge only when asset has vulnerabilities", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasVulnerabilities: true,
        }}
      />,
    );

    expect(screen.getByText("Vulnerabilities")).toBeInTheDocument();
    expect(screen.queryByText("Compromised")).not.toBeInTheDocument();
  });

  it("renders compromised badge only when asset has threats", () => {
    render(
      <AssetItem
        asset={{
          ...baseAsset,
          hasThreats: true,
        }}
      />,
    );

    expect(screen.getByText("Compromised")).toBeInTheDocument();
    expect(screen.queryByText("Vulnerabilities")).not.toBeInTheDocument();
  });

  it("does not render risk indicators when asset has no risks", () => {
    render(<AssetItem asset={baseAsset} />);

    expect(
      screen.queryByRole("group", { name: "Risk indicators" }),
    ).not.toBeInTheDocument();
  });
});
