---
name: lint-and-typecheck
description: Run lint and vue-tsc for web-antd and fix ESLint issues. Use before commit or when user says 检查规范.
---

## Commands

```bash
pnpm -F @vben/web-antd run typecheck 2>&1 | tail -80
pnpm lint 2>&1 | tail -80
```

## Instructions

Fix reported issues in changed files only. Prefer patterns from @vben/eslint-config. Do not disable rules with eslint-disable unless necessary and commented.
