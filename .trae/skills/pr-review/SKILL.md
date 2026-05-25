---
name: pr-review
description: Review diff against vue-vben-admin conventions before PR. Use when user asks for code review or /review.
---

## Checklist

Compare diff against main/develop branch and verify:

1. **Structure**: CRUD uses `api.ts`, `config.ts`, `index.vue`, `modules/form.vue` — no `list.vue` or `data.ts`.
2. **API**: Types in namespace; `requestClient` only; naming `getXxxList` / `createXxx` / `updateXxx` / `deleteXxx`.
3. **UI**: Ant Design Vue in web-antd; delete uses `Modal.confirm`; submit has loading guard.
4. **Types**: No unnecessary `any`; typecheck would pass.
5. **Security**: No secrets, no v-html on user content, permission fields correct.
6. **Scope**: Minimal diff; no unrelated refactors.

## Reference

- Gold standard: `apps/web-antd/src/views/system/user/`
- Rules: `.cursor/rules/` or `.claude/rules/`
