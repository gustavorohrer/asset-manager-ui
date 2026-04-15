import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();
const getAssetsSummaryMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/api/assets", () => ({
  getAssetsSummary: (...args: unknown[]) => getAssetsSummaryMock(...args),
}));

import {
  assetsSummaryQueryKey,
  useAssetsSummaryQuery,
} from "@/features/assets/hooks/use-assets-summary-query";

describe("useAssetsSummaryQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAssetsSummaryMock.mockReset();
  });

  it("builds a stable summary query key", () => {
    expect(assetsSummaryQueryKey()).toEqual(["assets", "summary"]);
  });

  it("calls useQuery with summary query key and API queryFn", async () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    getAssetsSummaryMock.mockResolvedValue({
      total: 1,
      withVulnerabilities: 1,
      withThreats: 1,
    });

    useAssetsSummaryQuery();

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly string[];
      queryFn: () => Promise<unknown>;
    };
    expect(options.queryKey).toEqual(["assets", "summary"]);

    await options.queryFn();
    expect(getAssetsSummaryMock).toHaveBeenCalledTimes(1);
  });
});
