import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetDetails } from "./asset-details";
import { useAssetQuery } from "./use-asset-query";
import { useAssetThreatsQuery } from "./use-asset-threats-query";
import { useAssetVulnerabilitiesQuery } from "./use-asset-vulnerabilities-query";

vi.mock("./use-asset-query");
vi.mock("./use-asset-vulnerabilities-query");
vi.mock("./use-asset-threats-query");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

const mockAsset = {
  id: "1",
  name: "Test Asset",
  description: "Test Description",
  createdAt: "2024-01-01T00:00:00Z",
  lastScan: "2024-01-02T00:00:00Z",
  hasVulnerabilities: true,
  hasThreats: true,
  components: [
    {
      id: "c1",
      name: "Comp 1",
      version: "1.0",
      vendor: "Vendor 1",
      type: "Type 1",
      createdAt: "2024-01-01T00:00:00Z",
      lastScan: "2024-01-02T00:00:00Z",
      assetId: "1",
    },
  ],
};

const mockAssetWithManyComponents = {
  ...mockAsset,
  components: Array.from({ length: 6 }, (_, index) => ({
    id: `c-${index + 1}`,
    name: `Comp ${index + 1}`,
    version: `${index + 1}.0`,
    vendor: `Vendor ${index + 1}`,
    type: "Type X",
    createdAt: "2024-01-01T00:00:00Z",
    lastScan: "2024-01-02T00:00:00Z",
    assetId: "1",
  })),
};

describe("AssetDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
      typeof useRouter
    >);
    vi.mocked(usePathname).mockReturnValue("/assets/1");
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );

    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      isLoading: false,
      data: { pages: [{ data: [], pagination: { total: 0 } }] },
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      isLoading: false,
      data: { pages: [{ data: [], pagination: { total: 0 } }] },
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);
  });

  it("renders loading state", () => {
    vi.mocked(useAssetQuery).mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);
    // Verifica que se renderiza el esqueleto (el nav con aria-hidden="true")
    expect(
      screen.getByRole("navigation", { hidden: true }),
    ).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    const refetch = vi.fn();
    vi.mocked(useAssetQuery).mockReturnValue({
      error: new Error("Network error"),
      isLoading: false,
      data: undefined,
      refetch,
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);
    expect(screen.getByText("Error loading asset")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Retry"));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders asset details and components", () => {
    vi.mocked(useAssetQuery).mockReturnValue({
      data: mockAsset,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);

    expect(
      screen.getByRole("heading", { level: 1, name: mockAsset.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockAsset.description)).toBeInTheDocument();
    expect(screen.getByText("Vulnerabilities detected")).toBeInTheDocument();
    expect(screen.getByText("Threats detected")).toBeInTheDocument();
    expect(screen.queryByText("Compromised")).not.toBeInTheDocument();
    expect(screen.getByText("Comp 1")).toBeInTheDocument();
    expect(screen.getByText("Vendor 1 • Version 1.0")).toBeInTheDocument();

    // Verify tabs
    expect(screen.getByRole("tab", { name: /Threats/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Vulnerabilities/i }),
    ).toBeInTheDocument();
  });

  it("collapses component details by default when there are many components", () => {
    vi.mocked(useAssetQuery).mockReturnValue({
      data: mockAssetWithManyComponents,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);

    expect(
      screen.getByText(
        "Component details are collapsed by default for easier scanning.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("First Seen")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Comp 1/i }));

    expect(screen.getByText("First Seen")).toBeInTheDocument();
  });

  it("changes tab and cleans other tab filters", () => {
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
      typeof useRouter
    >);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(
        "tab=threats&riskLevel=high",
      ) as unknown as ReturnType<typeof useSearchParams>,
    );
    vi.mocked(useAssetQuery).mockReturnValue({
      data: mockAsset,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);

    const vulnerabilitiesTab = screen.getByRole("tab", {
      name: /Vulnerabilities/i,
    });
    fireEvent.click(vulnerabilitiesTab);

    expect(push).toHaveBeenCalledWith("/assets/1?tab=vulnerabilities", {
      scroll: false,
    });
  });

  it("cleans severity filter when switching to threats", () => {
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
      typeof useRouter
    >);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(
        "tab=vulnerabilities&severity=critical",
      ) as unknown as ReturnType<typeof useSearchParams>,
    );
    vi.mocked(useAssetQuery).mockReturnValue({
      data: mockAsset,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useAssetQuery>);

    render(<AssetDetails id="1" />);

    const threatsTab = screen.getByRole("tab", {
      name: /Threats/i,
    });
    fireEvent.click(threatsTab);

    expect(push).toHaveBeenCalledWith("/assets/1?tab=threats", {
      scroll: false,
    });
  });
});
