import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AssetsStatsCards } from "@/features/assets/assets-stats-cards";

describe("AssetsStatsCards", () => {
  const summary = {
    total: 41,
    withVulnerabilities: 26,
    withThreats: 26,
  };

  it("renders summary cards with counts", () => {
    render(
      <AssetsStatsCards
        summary={summary}
        activeFilter="all"
        onFilterChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Total Inventory")).toBeInTheDocument();
    expect(screen.getByText("With Vulnerabilities")).toBeInTheDocument();
    expect(screen.getByText("With Threats")).toBeInTheDocument();
    expect(screen.getByText("41")).toBeInTheDocument();
    expect(screen.getAllByText("26")).toHaveLength(2);
  });

  it("reflects selected filter via aria-pressed", () => {
    render(
      <AssetsStatsCards
        summary={summary}
        activeFilter="threats"
        onFilterChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /With Threats/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /Total Inventory/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onFilterChange when a card is clicked", () => {
    const onFilterChange = vi.fn();

    render(
      <AssetsStatsCards
        summary={summary}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /With Threats/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /With Vulnerabilities/i }),
    );

    expect(onFilterChange).toHaveBeenNthCalledWith(1, "threats");
    expect(onFilterChange).toHaveBeenNthCalledWith(2, "vulnerabilities");
  });

  it("renders skeleton state while loading", () => {
    render(
      <AssetsStatsCards
        activeFilter="all"
        isLoading
        onFilterChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Total Inventory/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("", { selector: ".animate-pulse" }).length).toBe(
      6,
    );
  });

  it("renders error state and supports retry", () => {
    const onRetry = vi.fn();

    render(
      <AssetsStatsCards
        activeFilter="all"
        isError
        onFilterChange={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByText("Risk summary is temporarily unavailable."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
