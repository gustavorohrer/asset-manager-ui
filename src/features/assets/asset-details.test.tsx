import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AssetDetails } from "./asset-details";
import { useAssetQuery } from "./use-asset-query";
import { useAssetVulnerabilitiesQuery } from "./use-asset-vulnerabilities-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

vi.mock("./use-asset-query");
vi.mock("./use-asset-vulnerabilities-query");
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
  hasThreats: false,
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

describe("AssetDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);
    vi.mocked(usePathname).mockReturnValue("/assets/1");
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);

    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      isLoading: false,
      data: { pages: [{ data: [], pagination: { total: 0 } }] },
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);
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
    expect(screen.getByText("Comp 1")).toBeInTheDocument();
    expect(screen.getByText("Vendor 1 • Version 1.0")).toBeInTheDocument();
  });
});
