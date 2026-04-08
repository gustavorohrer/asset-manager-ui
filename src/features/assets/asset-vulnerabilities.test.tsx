import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetVulnerabilities } from "./asset-vulnerabilities";
import { useAssetVulnerabilitiesQuery } from "./use-asset-vulnerabilities-query";

vi.mock("./use-asset-vulnerabilities-query");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

const mockVulnerabilities = [
  {
    id: "v1",
    description: "Vuln 1",
    severity: "HIGH",
    componentId: "c1",
    componentName: "Comp 1",
    performedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "v2",
    description: "Vuln 2",
    severity: "CRITICAL",
    componentId: "c1",
    componentName: "Comp 1",
    performedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "v3",
    description: "Vuln 3",
    severity: "LOW",
    componentId: "c2",
    componentName: "Comp 2",
    performedAt: "2024-01-01T00:00:00Z",
  },
];

describe("AssetVulnerabilities", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
      typeof useRouter
    >);
    vi.mocked(usePathname).mockReturnValue("/assets/1");
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  it("renders loading state", () => {
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      isLoading: true,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);
    expect(screen.getByText("Vulnerabilities")).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    const refetch = vi.fn();
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      isError: true,
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);
    expect(
      screen.getByText("Error loading vulnerabilities"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retry"));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders empty state", () => {
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      data: { pages: [{ data: [], pagination: { total: 0 } }] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);
    expect(
      screen.getByText("No vulnerabilities found for latest scan"),
    ).toBeInTheDocument();
  });

  it("renders grouped and sorted vulnerabilities", () => {
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      data: {
        pages: [{ data: mockVulnerabilities, pagination: { total: 3 } }],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);

    expect(screen.getByText("Comp 1")).toBeInTheDocument();
    expect(screen.getByText("Comp 2")).toBeInTheDocument();
    expect(screen.getByText("3 vulnerabilities found")).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    // For Comp 1, Vuln 2 (CRITICAL) should be before Vuln 1 (HIGH)
    expect(listItems[0]).toHaveTextContent("Vuln 2");
    expect(listItems[1]).toHaveTextContent("Vuln 1");
  });

  it("renders 'Load more' button when hasNextPage is true", () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      data: {
        pages: [{ data: mockVulnerabilities, pagination: { total: 10 } }],
      },
      isLoading: false,
      isError: false,
      hasNextPage: true,
      fetchNextPage,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);
    const loadMoreButton = screen.getByText("Load more");
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("updates URL when clicking on a severity filter", () => {
    vi.mocked(useAssetVulnerabilitiesQuery).mockReturnValue({
      data: {
        pages: [{ data: mockVulnerabilities, pagination: { total: 3 } }],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetVulnerabilitiesQuery>);

    render(<AssetVulnerabilities assetId="1" />);

    const highFilter = screen.getByRole("button", { name: "HIGH" });
    fireEvent.click(highFilter);

    expect(push).toHaveBeenCalledWith("/assets/1?severity=high", {
      scroll: false,
    });
  });

  it("calls query with severity from URL", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("severity=critical") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<AssetVulnerabilities assetId="1" />);

    expect(useAssetVulnerabilitiesQuery).toHaveBeenCalledWith("1", "CRITICAL");
  });
});
