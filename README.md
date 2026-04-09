# Eclypsium Frontend Challenge

Security-oriented asset inventory UI built for fast reviewer evaluation.

## 1) Quick Evaluation Path (3-5 minutes, no installation)

1. Open the deployed app: `https://asset-manager-ui-pi.vercel.app/`
2. Validate list flow on `/`:
   - Search by asset name.
   - Toggle `With vulnerabilities` and `With threats`.
   - Use advanced date filters and sort.
   - Confirm pagination works.
3. Open any asset:
   - Confirm components are listed with risk chips.
   - Check `Threats` and `Vulnerabilities` tabs.
   - Apply severity/risk filters and use `Load more`.
4. Trigger an invalid query or temporary network failure to verify retry/error states.

Primary review path is the deployed app. Local setup is optional.

## 2) What is implemented (core + extras)

Core:
- Asset list with API-backed pagination.
- Asset details route with component inventory.
- Threat and vulnerability inventories per asset.
- Filtering by search, finding type, date range, severity/risk level, and sort.

Extras:
- Risk summary cards (`Total Inventory`, `With Vulnerabilities`, `With Threats`) from `/assets/summary`.
- URL-driven filter state for reproducible reviewer checks.
- Risk-prioritized default inventory mode (`has_findings=true`) with dismiss action.
- In-page jump from component risk chips to findings section.
- Explicit loading, empty, error, and retry states across list/details/findings.
- Runtime contract validation with Zod at API boundaries.
- Unit tests for API/domain/feature behavior with Vitest + Testing Library.

## 3) Requirement-to-implementation matrix

| Requirement | Implementation | Quick reviewer evidence |
| --- | --- | --- |
| List assets | `GET /assets` with paginated query state | Home page shows page controls and updates result set |
| Filter inventory | Search, findings toggles, last scan date range, sort | URL query params update while filtering and list updates |
| Inspect one asset | Dynamic route `/assets/[id]` + metadata + components | Click any asset card and verify breadcrumb + component accordion |
| Review vulnerabilities | `GET /assets/:id/vulnerabilities` with severity filter and paging | Open Vulnerabilities tab, filter by severity, use `Load more` |
| Review threats | `GET /assets/:id/threats` with risk-level filter and paging | Open Threats tab, filter by risk level, use `Load more` |
| Evaluate risk posture quickly | `/assets/summary` cards + risk chips on assets/components | Summary cards and badges are visible on list/details |
| Trust runtime correctness | Zod response parsing in API layer | Invalid payloads fail at boundary instead of silently rendering |

## 4) Architecture and key decisions

- Stack: Next.js App Router + React 19 + React Query + Zod + Tailwind.
- Data flow:
  - API calls in `src/api/*`.
  - Runtime validation and domain schemas in `src/domain/*`.
  - Query hooks and UI orchestration in `src/features/assets/*`.
- Decision: this frontend intentionally uses a custom backend and does **not** adapt to the challenge mock backend.
- Rationale: the custom backend is the contract source of truth used across frontend behavior, validation, and review.

## 5) Optional local run path (minimal)

Prerequisites: Node.js 20+, pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

App: `http://localhost:3000`

Default API base URL in `.env.example`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://asset-manager-production-ddd8.up.railway.app
```

## 6) Quality and validation commands

Required gate:

```bash
pnpm check && pnpm test && pnpm build
```

## 7) Known trade-offs / out of scope

- No create/update/delete asset workflows; this submission focuses on read and risk triage.
- No auth/role model; assumes trusted reviewer context.
- No E2E suite in this repository; coverage is unit/component-focused.
- Backend contract is the custom backend contract; challenge mock backend compatibility is intentionally out of scope.

## 8) Links needed by reviewer

- Deployed app: `https://asset-manager-ui-pi.vercel.app/`
- Hosted backend: `https://asset-manager-production-ddd8.up.railway.app`
- Backend repository: `https://github.com/gustavorohrer/asset-manager`
- OpenAPI contract: `https://github.com/gustavorohrer/asset-manager/blob/main/docs/openapi/openapi.yaml`
