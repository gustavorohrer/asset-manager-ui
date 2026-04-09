import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetsList } from "@/features/assets/assets-list";

const replaceMock = vi.fn();
const useAssetsQueryMock = vi.fn();
const useAssetsSummaryQueryMock = vi.fn();

let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => "/assets",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/features/assets/use-assets-query", () => ({
  useAssetsQuery: (...args: unknown[]) => useAssetsQueryMock(...args),
}));

vi.mock("@/features/assets/use-assets-summary-query", () => ({
  useAssetsSummaryQuery: (...args: unknown[]) =>
    useAssetsSummaryQueryMock(...args),
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
    window.sessionStorage.clear();
    currentSearchParams = new URLSearchParams();
    replaceMock.mockReset();
    useAssetsQueryMock.mockReset();
    useAssetsSummaryQueryMock.mockReset();
    useAssetsSummaryQueryMock.mockReturnValue({
      data: {
        total: 3,
        withVulnerabilities: 0,
        withThreats: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useAssetsQueryMock.mockImplementation(
      (
        search?: string,
        _sortBy?: string,
        _sortOrder?: string,
        _lastScanFrom?: string,
        _lastScanTo?: string,
        hasVulnerabilities?: boolean,
        hasThreats?: boolean,
        hasFindings?: boolean,
      ) => {
        let filtered = [...assets];

        if (search) {
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(search.toLowerCase()) ||
              a.description.toLowerCase().includes(search.toLowerCase()),
          );
        }

        if (hasVulnerabilities) {
          filtered = filtered.filter((a) => a.hasVulnerabilities);
        }

        if (hasThreats) {
          filtered = filtered.filter((a) => a.hasThreats);
        }

        if (hasFindings) {
          filtered = filtered.filter(
            (a) => a.hasVulnerabilities || a.hasThreats,
          );
        }

        return {
          data: {
            pages: [
              {
                data: filtered,
                pagination: {
                  page: 1,
                  totalPages: 1,
                  total: filtered.length,
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
      },
    );
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
    expect(
      screen
        .getByRole("button", { name: "With vulnerabilities" })
        .getAttribute("data-pressed"),
    ).toBe("true");

    expect(screen.getByText("Web Gateway")).toBeInTheDocument();
    expect(screen.queryByText("Gateway Replica")).not.toBeInTheDocument();
    expect(screen.queryByText("Database Server")).not.toBeInTheDocument();
  });

  it("does not send risk flags to query hook when URL has no risk params", () => {
    render(<AssetsList />);

    expect(useAssetsQueryMock).toHaveBeenCalledWith(
      "",
      "createdAt",
      "desc",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("sends only selected risk flag to query hook", () => {
    currentSearchParams = new URLSearchParams("vuln=1");
    render(<AssetsList />);

    expect(useAssetsQueryMock).toHaveBeenCalledWith(
      "",
      "createdAt",
      "desc",
      undefined,
      undefined,
      true,
      undefined,
      undefined,
    );

    currentSearchParams = new URLSearchParams("threat=1");
    render(<AssetsList />);

    expect(useAssetsQueryMock).toHaveBeenCalledWith(
      "",
      "createdAt",
      "desc",
      undefined,
      undefined,
      undefined,
      true,
      undefined,
    );
  });

  it("applies risk-priority filter on first load when URL is clean and there are findings", async () => {
    useAssetsSummaryQueryMock.mockReturnValue({
      data: {
        total: 3,
        withVulnerabilities: 1,
        withThreats: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AssetsList />);

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/assets?findings=1", {
        scroll: false,
      }),
    );
  });

  it("does not auto-apply risk priority when exclusion filters already exist", () => {
    useAssetsSummaryQueryMock.mockReturnValue({
      data: {
        total: 3,
        withVulnerabilities: 1,
        withThreats: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    currentSearchParams = new URLSearchParams("q=gateway");

    render(<AssetsList />);

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows risk-priority banner and clears only risk params on 'View full inventory'", () => {
    currentSearchParams = new URLSearchParams(
      "q=gateway&findings=1&sortBy=name&sortOrder=asc",
    );

    render(<AssetsList />);

    expect(
      screen.getByText(/You are viewing a risk-prioritized inventory/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /View full inventory/i }),
    );

    expect(replaceMock).toHaveBeenCalledWith(
      "/assets?q=gateway&sortBy=name&sortOrder=asc",
      {
        scroll: false,
      },
    );
  });

  it("does not re-apply auto risk-priority after user opts out in the same session", () => {
    const { rerender } = render(<AssetsList />);

    currentSearchParams = new URLSearchParams("findings=1");
    rerender(<AssetsList />);
    fireEvent.click(
      screen.getByRole("button", { name: /View full inventory/i }),
    );

    replaceMock.mockClear();
    currentSearchParams = new URLSearchParams();
    rerender(<AssetsList />);

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("renders stats cards from summary endpoint data", () => {
    render(<AssetsList />);

    expect(
      screen.getByRole("button", { name: /^Total Inventory\d+$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^With Vulnerabilities\d+$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^With Threats\d+$/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("updates URL params when a risk chip is toggled", () => {
    render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: "With threats" }));

    expect(replaceMock).toHaveBeenCalledWith("/assets?threat=1", {
      scroll: false,
    });
  });

  it("updates URL params when a stats card is clicked", () => {
    currentSearchParams = new URLSearchParams("q=gateway&vuln=1");

    render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: /^With Threats\d+$/ }));

    expect(replaceMock).toHaveBeenCalledWith("/assets?q=gateway&threat=1", {
      scroll: false,
    });
  });

  it("clears exclusion filters and keeps sorting when total inventory card is clicked", () => {
    currentSearchParams = new URLSearchParams(
      "q=gateway&vuln=1&lastScanFrom=2026-01-01&sortBy=name&sortOrder=asc",
    );

    render(<AssetsList />);

    fireEvent.click(
      screen.getByRole("button", { name: /^Total Inventory\d+$/ }),
    );

    expect(replaceMock).toHaveBeenCalledWith(
      "/assets?sortBy=name&sortOrder=asc",
      {
        scroll: false,
      },
    );
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

  it("updates URL params when sorting is changed", () => {
    render(<AssetsList />);

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: "name-asc" },
    });

    expect(replaceMock).toHaveBeenCalledWith(
      "/assets?sortBy=name&sortOrder=asc",
      {
        scroll: false,
      },
    );
  });

  it("resets sorting to default when clearing filters", () => {
    currentSearchParams = new URLSearchParams("sortBy=name&sortOrder=asc");

    render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(replaceMock).toHaveBeenCalledWith("/assets", {
      scroll: false,
    });
  });

  it("shows and hides advanced filters panel", () => {
    render(<AssetsList />);

    expect(screen.queryByLabelText(/Last scan from/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    expect(screen.getByLabelText(/Last scan from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last scan to/i)).toBeInTheDocument();
  });

  it("updates URL params when date range is changed and Apply is clicked", () => {
    render(<AssetsList />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    fireEvent.change(screen.getByLabelText(/Last scan from/i), {
      target: { value: "2026-01-01" },
    });

    // Should not have called replace yet
    expect(replaceMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

    expect(replaceMock).toHaveBeenCalledWith(
      "/assets?lastScanFrom=2026-01-01",
      {
        scroll: false,
      },
    );
  });

  it("disables Apply button when date range is invalid", () => {
    render(<AssetsList />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    fireEvent.change(screen.getByLabelText(/Last scan from/i), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/Last scan to/i), {
      target: { value: "2026-01-01" },
    });

    expect(screen.getByRole("button", { name: /Apply/i })).toBeDisabled();

    expect(
      screen.getByText(/"From" date cannot be after "To" date./i),
    ).toBeInTheDocument();
  });

  it("prevents manual keyboard input on date fields", () => {
    render(<AssetsList />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    const fromInput = screen.getByLabelText(/Last scan from/i);

    const event = new KeyboardEvent("keydown", {
      key: "a",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    fireEvent(fromInput, event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("calls showPicker on date fields when clicked", () => {
    const showPickerMock = vi.fn();

    render(<AssetsList />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    const fromInput = screen.getByLabelText(/Last scan from/i);
    // @ts-expect-error - JSDOM doesn't have showPicker
    fromInput.showPicker = showPickerMock;

    fireEvent.click(fromInput);

    expect(showPickerMock).toHaveBeenCalled();
  });
});
