const DEFAULT_API_BASE_URL =
  "https://asset-manager-production-ddd8.up.railway.app";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return normalizeBaseUrl(value);
}
