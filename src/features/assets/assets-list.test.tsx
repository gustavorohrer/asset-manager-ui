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
  useAssetsQuery: (...args: unknown[]) => useAssetsQueryMock(...args),
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
    useAssetsQueryMock.mockImplementation(
      (
        search?: string,
        _sortBy?: string,
        _sortOrder?: string,
        _lastScanFrom?: string,
        _lastScanTo?: string,
        hasVulnerabilities?: boolean,
        hasThreats?: boolean,
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
