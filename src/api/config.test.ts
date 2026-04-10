import { afterEach, describe, expect, it, vi } from "vitest";

import { getApiBaseUrl } from "@/api/config";

const DEFAULT_API_BASE_URL =
  "https://asset-manager-production-ddd8.up.railway.app";

describe("getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns normalized env value when NEXT_PUBLIC_API_BASE_URL is valid", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com///");

    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("returns default value when env variable is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", undefined);

    expect(getApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);
  });

  it("returns default value when env variable is invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "not-a-url");
    expect(getApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "ftp://api.example.com");
    expect(getApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);
  });

  it("trims env variable value before validation", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "  https://api.example.com/  ");

    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });
});
