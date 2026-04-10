# Eclypsium Frontend Challenge

Security-focused asset inventory UI built for quick reviewer evaluation.

## Quick Review (3-5 minutes)

1. Open the deployed app: `https://asset-manager-ui-pi.vercel.app/`
2. On `/`, validate:
   - Search by asset name.
   - `With vulnerabilities` and `With threats` filters.
   - Advanced last-scan date filters.
   - Sorting and pagination.
3. Open any asset and validate:
   - Component inventory in the details page.
   - `Threats` and `Vulnerabilities` tabs.
   - Severity/risk filtering and `Load more`.
4. Verify retry paths by forcing a temporary network error.

## Scope Implemented

Core:
- Asset listing with API-backed pagination.
- Filterable inventory by relevant criteria.

Optional/extended:
- Asset detail view with component breakdown.
- Threat and vulnerability analysis by asset.
- Risk summary cards (`Total Inventory`, `With Threats`, `With Vulnerabilities`).
- URL-driven filter state for reproducible review steps.
- Explicit loading, empty, error, and retry states.
- Runtime contract validation with Zod at API boundaries.
- Unit/component tests with Vitest + Testing Library.

## Tech Stack

- Next.js App Router + React 19 + TypeScript.
- TanStack Query for server-state orchestration.
- Zod for runtime API contract validation.
- Tailwind CSS + Base UI primitives.

Code organization:
- `src/api`: API client functions.
- `src/domain`: schemas and domain types.
- `src/features/assets`: feature-level UI and query hooks.

## Local Setup

Prerequisites: Node.js 20+, pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

App URL: `http://localhost:3000`

Default API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=https://asset-manager-production-ddd8.up.railway.app
```

Optional deployed smoke E2E:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `E2E_BASE_URL` to override the target URL when needed.

Full local verification gate:

```bash
pnpm verify
```

## Notes

- This frontend targets the custom backend contract listed below.
- Legacy mock files are kept in `backend-mock/` and `docker-compose.yml` for reference only, and are not used by the active app/CI path.

## Reviewer Links

- Deployed app: `https://asset-manager-ui-pi.vercel.app/`
- Hosted backend: `https://asset-manager-production-ddd8.up.railway.app`
- Backend repository: `https://github.com/gustavorohrer/asset-manager`
- OpenAPI contract: `https://github.com/gustavorohrer/asset-manager/blob/main/docs/openapi/openapi.yaml`
