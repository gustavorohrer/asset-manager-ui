# Eclypsium Frontend Challenge

Frontend solution for the Eclypsium Senior Software Engineer challenge.

---

## Reviewer Quick Start (No Setup Required)

- Open the deployed app: `<DEPLOYED_FRONTEND_URL>`
- Validate the core flow:
    - Asset listing
    - Navigation between assets
    - Asset details and vulnerabilities (if enabled in UI)

- API data source: custom backend implementation (not the original mock backend)

> The deployed app is the primary review path. No local installation is required.

---

## Architecture Decision

The original challenge suggests consuming a provided mock backend.

This project intentionally uses a **custom backend implementation**, developed as part of a related backend challenge.

This decision was made to work with a more realistic and complete API, enabling better alignment between frontend behavior and real-world use cases.

---

## Backend Source of Truth

The frontend consumes a custom backend, which is considered the source of truth for:

- data models
- API contracts
- domain behavior

- Backend repository: https://github.com/gustavorohrer/asset-manager
- Hosted backend: https://asset-manager-production-ddd8.up.railway.app
- OpenAPI contract: https://github.com/gustavorohrer/asset-manager/blob/main/docs/openapi/openapi.yaml

---

## Challenge Scope (Frontend)

Core requirement implemented:

- Asset listing

Optional/extended views may include:

- Asset details
- Components
- Vulnerabilities and threat visibility

---

## API Endpoints Used

Core read endpoints:

- `GET /assets`
- `GET /assets/:id`
- `GET /assets/:id/vulnerabilities`

Additional endpoints are documented in the backend OpenAPI specification.

---

## Local Setup (Optional)

### Prerequisites

- Node.js
- pnpm

### Run locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the frontend:
   ```bash
   pnpm dev
   ```

3. The app is preconfigured to use the public backend:
   ```
   https://asset-manager-production-ddd8.up.railway.app
   ```

---

## Engineering Approach

- Prioritized clarity and reviewer experience over feature count
- Built incrementally with small, atomic changes
- Focused on production-like structure and maintainability
- Used AI as a tool with strict rules and validation, not as a decision-maker

---

## Notes for Reviewers

- The original mock backend is not used in this implementation, as the project relies on a custom backend aligned with the same domain.
- No Docker or mock setup is required.
- The deployed version is the recommended way to evaluate the project.

---

## Support

If anything is unclear during evaluation, feel free to open an issue in this repository.
