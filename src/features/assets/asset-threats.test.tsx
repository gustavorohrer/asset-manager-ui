import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetThreats } from "./asset-threats";
import { useAssetThreatsQuery } from "./use-asset-threats-query";

vi.mock("./use-asset-threats-query");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

const mockThreats = [
  {
    id: "t1",
    description: "Threat 1",
    riskLevel: "HIGH",
    type: "Firmware Implant",
    componentId: "c1",
    componentName: "Comp 1",
    performedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "t2",
    description: "Threat 2",
    riskLevel: "MEDIUM",
    type: "OS Modification",
    componentId: "c1",
    componentName: "Comp 1",
    performedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "t3",
    description: "Threat 3",
    riskLevel: "LOW",
    type: "Unexpected Service",
    componentId: "c2",
    componentName: "Comp 2",
    performedAt: "2024-01-01T00:00:00Z",
  },
];

describe("AssetThreats", () => {
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
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      isLoading: true,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);
    expect(screen.getByText("Threats")).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    const refetch = vi.fn();
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      isError: true,
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);
    expect(screen.getByText("Error loading threats")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retry"));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders empty state", () => {
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      data: { pages: [{ data: [], pagination: { total: 0 } }] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);
    expect(
      screen.getByText("No threats found for latest scan"),
    ).toBeInTheDocument();
  });

  it("renders grouped and sorted threats", () => {
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      data: {
        pages: [{ data: mockThreats, pagination: { total: 3 } }],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);

    expect(screen.getByText("Comp 1")).toBeInTheDocument();
    expect(screen.getByText("Comp 2")).toBeInTheDocument();
    expect(screen.getByText("3 threats found")).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    // For Comp 1, t1 (HIGH) should be before t2 (MEDIUM)
    expect(listItems[0]).toHaveTextContent("Threat 1");
    expect(listItems[1]).toHaveTextContent("Threat 2");

    // Check for "High risk" badge on HIGH risk threat
    expect(screen.getByText("High risk")).toBeInTheDocument();
    // Check for type
    expect(screen.getByText("Firmware Implant")).toBeInTheDocument();
  });

  it("renders 'Load more' button when hasNextPage is true", () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      data: {
        pages: [{ data: mockThreats, pagination: { total: 10 } }],
      },
      isLoading: false,
      isError: false,
      hasNextPage: true,
      fetchNextPage,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);
    const loadMoreButton = screen.getByText("Load more");
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("updates URL when clicking on a riskLevel filter", () => {
    vi.mocked(useAssetThreatsQuery).mockReturnValue({
      data: {
        pages: [{ data: mockThreats, pagination: { total: 3 } }],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAssetThreatsQuery>);

    render(<AssetThreats assetId="1" />);

    const highFilter = screen.getByRole("button", { name: "HIGH" });
    fireEvent.click(highFilter);

    expect(push).toHaveBeenCalledWith("/assets/1?riskLevel=high", {
      scroll: false,
    });
  });

  it("calls query with riskLevel from URL", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("riskLevel=high") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<AssetThreats assetId="1" />);

    expect(useAssetThreatsQuery).toHaveBeenCalledWith("1", "HIGH");
  });
});
