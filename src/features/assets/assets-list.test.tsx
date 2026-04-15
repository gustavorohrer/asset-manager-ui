import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetsList } from "@/features/assets/assets-list";

const replaceMock = vi.fn();
const useAssetsPageQueryMock = vi.fn();
const useAssetsSummaryQueryMock = vi.fn();
const scrollIntoViewMock = vi.fn();

let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => "/assets",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/features/assets/hooks/use-assets-query", () => ({
  useAssetsPageQuery: (...args: unknown[]) => useAssetsPageQueryMock(...args),
}));

vi.mock("@/features/assets/hooks/use-assets-summary-query", () => ({
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
    scrollIntoViewMock.mockReset();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoViewMock,
      writable: true,
    });
    currentSearchParams = new URLSearchParams();
    replaceMock.mockReset();
    useAssetsPageQueryMock.mockReset();
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
    useAssetsPageQueryMock.mockImplementation(
      (params?: {
        page?: number;
        search?: string;
        hasVulnerabilities?: boolean;
        hasThreats?: boolean;
        hasFindings?: boolean;
      }) => {
        const search = params?.search;
        const hasVulnerabilities = params?.hasVulnerabilities;
        const hasThreats = params?.hasThreats;
        const hasFindings = params?.hasFindings;
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
            data: filtered,
            pagination: {
              page: 1,
              pageSize: 20,
              totalPages: 1,
              total: filtered.length,
            },
          },
          error: null,
          isLoading: false,
          isFetching: false,
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

    expect(useAssetsPageQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        lastScanFrom: undefined,
        lastScanTo: undefined,
        hasVulnerabilities: undefined,
        hasThreats: undefined,
        hasFindings: undefined,
      }),
    );
  });

  it("falls back to safe defaults when sort and page URL params are invalid", () => {
    currentSearchParams = new URLSearchParams(
      "sortBy=invalid-sort&sortOrder=invalid-order&page=not-a-number",
    );

    render(<AssetsList />);

    expect(useAssetsPageQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        lastScanFrom: undefined,
        lastScanTo: undefined,
        hasVulnerabilities: undefined,
        hasThreats: undefined,
        hasFindings: undefined,
      }),
    );
  });

  it("sends only selected risk flag to query hook", () => {
    currentSearchParams = new URLSearchParams("vuln=1");
    render(<AssetsList />);

    expect(useAssetsPageQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        lastScanFrom: undefined,
        lastScanTo: undefined,
        hasVulnerabilities: true,
        hasThreats: undefined,
        hasFindings: undefined,
      }),
    );

    currentSearchParams = new URLSearchParams("threat=1");
    render(<AssetsList />);

    expect(useAssetsPageQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        lastScanFrom: undefined,
        lastScanTo: undefined,
        hasVulnerabilities: undefined,
        hasThreats: true,
        hasFindings: undefined,
      }),
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
    const summarySection = within(screen.getByLabelText("Asset risk summary"));

    expect(
      summarySection.getByRole("button", { name: /^Total Inventory/i }),
    ).toBeInTheDocument();
    expect(
      summarySection.getByRole("button", { name: /^With Vulnerabilities/i }),
    ).toBeInTheDocument();
    expect(
      summarySection.getByRole("button", { name: /^With Threats/i }),
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

  it("debounces search URL updates", () => {
    vi.useFakeTimers();

    try {
      render(<AssetsList />);

      const searchInput = screen.getByLabelText("Search");
      fireEvent.change(searchInput, { target: { value: "g" } });
      fireEvent.change(searchInput, { target: { value: "ga" } });
      fireEvent.change(searchInput, { target: { value: "gat" } });

      expect(replaceMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(299);
      expect(replaceMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(replaceMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/assets?q=gat", {
        scroll: false,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps local search text while focused even if URL updates lag behind", () => {
    const { rerender } = render(<AssetsList />);

    const searchInput = screen.getByLabelText("Search");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "gateway" } });
    fireEvent.change(searchInput, { target: { value: "" } });

    currentSearchParams = new URLSearchParams("q=gateway");
    rerender(<AssetsList />);

    expect(screen.getByLabelText("Search")).toHaveValue("");
  });

  it("updates URL params when a stats card is clicked", () => {
    currentSearchParams = new URLSearchParams("q=gateway&vuln=1");

    render(<AssetsList />);
    const summarySection = within(screen.getByLabelText("Asset risk summary"));

    fireEvent.click(
      summarySection.getByRole("button", { name: /^With Threats/i }),
    );

    expect(replaceMock).toHaveBeenCalledWith("/assets?q=gateway&threat=1", {
      scroll: false,
    });
  });

  it("clears exclusion filters and keeps sorting when total inventory card is clicked", () => {
    currentSearchParams = new URLSearchParams(
      "q=gateway&vuln=1&lastScanFrom=2026-01-01&sortBy=name&sortOrder=asc",
    );

    render(<AssetsList />);
    const summarySection = within(screen.getByLabelText("Asset risk summary"));

    fireEvent.click(
      summarySection.getByRole("button", { name: /^Total Inventory/i }),
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

  it("does not block keyboard events on date fields", () => {
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

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("exposes invalid date range message to assistive tech", () => {
    render(<AssetsList />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced Filters/i }));

    fireEvent.change(screen.getByLabelText(/Last scan from/i), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/Last scan to/i), {
      target: { value: "2026-01-01" },
    });

    const fromInput = screen.getByLabelText(/Last scan from/i);
    const toInput = screen.getByLabelText(/Last scan to/i);
    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent('"From" date cannot be after "To" date.');
    expect(fromInput).toHaveAttribute("aria-invalid", "true");
    expect(toInput).toHaveAttribute("aria-invalid", "true");
    expect(fromInput).toHaveAttribute(
      "aria-describedby",
      "assets-date-range-error",
    );
    expect(toInput).toHaveAttribute(
      "aria-describedby",
      "assets-date-range-error",
    );
  });

  it("reads page param and sends it to assets page query hook", () => {
    currentSearchParams = new URLSearchParams("page=2");

    render(<AssetsList />);

    expect(useAssetsPageQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        lastScanFrom: undefined,
        lastScanTo: undefined,
        hasVulnerabilities: undefined,
        hasThreats: undefined,
        hasFindings: undefined,
      }),
    );
  });

  it("updates URL with next page and scrolls to assets section on page change", async () => {
    useAssetsPageQueryMock.mockImplementation((params?: { page?: number }) => {
      const page = params?.page ?? 1;

      return {
        data: {
          data: assets,
          pagination: {
            page,
            pageSize: 20,
            totalPages: 3,
            total: 45,
          },
        },
        error: null,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    const { rerender } = render(<AssetsList />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(replaceMock).toHaveBeenCalledWith("/assets?page=2", {
      scroll: false,
    });

    currentSearchParams = new URLSearchParams("page=2");
    rerender(<AssetsList />);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  it("shows async status when list is refetching", () => {
    useAssetsPageQueryMock.mockReturnValue({
      data: {
        data: assets,
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 1,
          total: assets.length,
        },
      },
      error: null,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    });

    render(<AssetsList />);

    expect(screen.getByText("Updating results...")).toBeInTheDocument();
  });
});
