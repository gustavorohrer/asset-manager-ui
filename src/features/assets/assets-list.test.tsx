import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetsList } from "@/features/assets/assets-list";

const replaceMock = vi.fn();
const useAssetsQueryMock = vi.fn();

let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => "/assets",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/features/assets/use-assets-query", () => ({
  useAssetsQuery: () => useAssetsQueryMock(),
}));

const assets = [
  {
    id: "1",
    name: "Database Server",
    description: "Primary PostgreSQL cluster",
    createdAt: "2026-01-10T10:00:00.000Z",
    lastScan: null,
    hasVulnerabilities: false,
    hasThreats: false,
  },
  {
    id: "2",
    name: "Web Gateway",
    description: "External traffic ingress",
    createdAt: "2026-01-12T10:00:00.000Z",
    lastScan: "2026-01-15T10:00:00.000Z",
    hasVulnerabilities: true,
    hasThreats: false,
  },
  {
    id: "3",
    name: "Gateway Replica",
    description: "Secondary ingress node",
    createdAt: "2026-01-22T10:00:00.000Z",
    lastScan: "2026-01-28T10:00:00.000Z",
    hasVulnerabilities: false,
    hasThreats: true,
  },
];

describe("AssetsList", () => {
  beforeEach(() => {
    currentSearchParams = new URLSearchParams();
    replaceMock.mockReset();
    useAssetsQueryMock.mockReset();
    useAssetsQueryMock.mockImplementation((search?: string) => {
      const filteredBySearch = search
        ? assets.filter(
            (a) =>
              a.name.toLowerCase().includes(search.toLowerCase()) ||
              a.description.toLowerCase().includes(search.toLowerCase()),
          )
        : assets;

      return {
        data: {
          pages: [
            {
              data: filteredBySearch,
              pagination: {
                page: 1,
                totalPages: 1,
                total: filteredBySearch.length,
              },
            },
          ],
        },
        error: null,
        isLoading: false,
        isFetching: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        refetch: vi.fn(),
      };
    });
  });

  it("reads query params and applies text + risk filtering", () => {
    currentSearchParams = new URLSearchParams("q=gateway&vuln=1");

    render(<AssetsList />);

    expect(screen.getByDisplayValue("gateway")).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "With vulnerabilities" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    expect(screen.getByText("Web Gateway")).toBeInTheDocument();
    expect(screen.queryByText("Gateway Replica")).not.toBeInTheDocument();
    expect(screen.queryByText("Database Server")).not.toBeInTheDocument();
  });

  it("updates URL params when a risk chip is toggled", () => {
    render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: "With threats" }));

    expect(replaceMock).toHaveBeenCalledWith("/assets?threat=1", {
      scroll: false,
    });
  });

  it("clears all filters from URL", () => {
    currentSearchParams = new URLSearchParams("q=gateway&vuln=1&threat=1");

    render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(replaceMock).toHaveBeenCalledWith("/assets", {
      scroll: false,
    });
  });

  it("shows empty state when filters have no matches", () => {
    currentSearchParams = new URLSearchParams("q=gateway&threat=1&vuln=1");

    render(<AssetsList />);

    expect(
      screen.getByText("No assets match the current filters."),
    ).toBeInTheDocument();
  });
});
