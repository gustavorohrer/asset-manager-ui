const DEFAULT_API_BASE_URL =
  "https://asset-manager-production-ddd8.up.railway.app";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function isValidApiBaseUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function getApiBaseUrl(): string {
  const envValue = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const baseUrl =
    envValue && isValidApiBaseUrl(envValue) ? envValue : DEFAULT_API_BASE_URL;

  return normalizeBaseUrl(baseUrl);
}
