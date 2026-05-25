---
name: vben-mock-api
description: Add or update mock API handlers in apps/backend-mock when backend is not ready. Use when wiring CRUD pages to local mock data.
---

## Steps

1. Locate existing handlers under `apps/backend-mock/` (routes, utils/mock-data.ts).
2. Add REST endpoints matching `views/<module>/api.ts` paths.
3. Follow existing mock response shape used by system/user or system/dept.
4. Update `mock-data.ts` seed data if list endpoints need fixtures.
5. Verify with `pnpm dev:antd` and browser network tab.

## Constraints

- Keep mock paths aligned with `requestClient` base URL config.
- Do not hardcode secrets or production URLs.
