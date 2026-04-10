# Eclypsium Frontend Challenge

Security-focused asset inventory UI designed for fast risk triage review.

## 2-3 Minute Demo Flow

1. Open the risk-prioritized inventory:
   - `https://asset-manager-ui-pi.vercel.app/?findings=1`
2. On the home view, validate:
   - Risk summary cards with counts and percentages.
   - `Top risky assets (current page)` insight (weighted + normalized top 3).
3. Open a filtered inventory view:
   - `https://asset-manager-ui-pi.vercel.app/?q=nimble&threat=1&sortBy=lastScan&sortOrder=desc`
4. Open a concrete asset detail:
   - `https://asset-manager-ui-pi.vercel.app/assets/AST-041?tab=threats`
   - Validate component inventory and threat triage flow.
5. Switch to vulnerability triage:
   - `https://asset-manager-ui-pi.vercel.app/assets/AST-041?tab=vulnerabilities&severity=high`
   - Validate tab switching, filter state in URL, and findings lists.

Expected reviewer time: ~2-3 minutes.

## Why This Demo Path

- It mirrors the intended workflow: inventory prioritization to asset investigation to findings triage.
- It highlights user-facing risk clarity first (percentages + top risky assets), then drill-down depth.
- It uses reproducible URLs for deterministic review.
- The demo runs against the same custom backend contract used by this frontend.

## Scope Implemented

Core:
- Asset listing with API-backed pagination.
- Filterable inventory by relevant criteria.

Optional enhancements:
- Asset detail view with component breakdown.
- Threat and vulnerability analysis by asset.
- Risk summary cards (`Total Inventory`, `With Threats`, `With Vulnerabilities`).
- Percentage context on risk cards (e.g., `63% of total assets`).
- `Top risky assets (current page)` insight (weighted + normalized, filter-aware).
- URL-driven filter state for reproducible review steps.
- Explicit loading, empty, error, and retry states.
- Runtime contract validation with Zod at API boundaries.
- Unit/component tests with Vitest + Testing Library.
- Smoke E2E reviewer flow against the deployed app (Playwright).

## Design Decisions & Trade-offs

- URL-driven filter state for reproducible reviewer checks and shareable deep links.
- Runtime schema validation (Zod) at API boundaries for safer UI rendering.
- `Top risky assets` is intentionally current-page/filter-aware (fast, useful, not positioned as global analytics).
- Smoke E2E is focused on reviewer-critical flow; broader E2E coverage is intentionally out of scope.
- This frontend intentionally uses the custom backend contract used by this implementation.

## Out of Scope

- Asset create/update/delete workflows.
- Authentication and role/permission model.
- Historical trends over time.
- Global risk analytics across the full dataset beyond current filtered results.

## Local Setup

Prerequisites: Node.js 20+, pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

App URL: `http://localhost:3000`

Default API base URL (custom backend):

```bash
NEXT_PUBLIC_API_BASE_URL=https://asset-manager-production-ddd8.up.railway.app
```

Optional deployed smoke E2E:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `E2E_BASE_URL` to override the target URL when needed.

Verification gate:

```bash
pnpm verify
```

## CI Checks

- `Contract` job: biome checks, unit tests, live API contract tests, build.
- `E2E Smoke` job: Playwright smoke flow (Chromium) against deploy URL, with artifacts uploaded on failure.
- Optional GitHub Repository Variables: `API_BASE_URL` and `E2E_BASE_URL` (fallbacks are already configured).

## Reviewer Links

- Deployed app: `https://asset-manager-ui-pi.vercel.app/`
- Hosted backend: `https://asset-manager-production-ddd8.up.railway.app`
- Backend repository: `https://github.com/gustavorohrer/asset-manager`
- OpenAPI contract: `https://github.com/gustavorohrer/asset-manager/blob/main/docs/openapi/openapi.yaml`
