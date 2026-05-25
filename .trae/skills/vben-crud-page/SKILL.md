---
name: vben-crud-page
description: Create a new Vben Admin CRUD page under apps/web-antd/src/views with api.ts, config.ts, index.vue, modules/form.vue. Use when user asks to add a management page, list page, or CRUD module.
---

## Inputs required

Ask user if missing:

- module path, e.g. `ai/prompt`
- Chinese menu title
- API prefix, e.g. `/ai/prompt`
- fields list (name, type, required, search/filter/table flags)

## Reference implementation

Copy structure from:

- `apps/web-antd/src/views/system/user/`

## Steps

1. Create `api.ts` with namespace, interfaces, getList/create/update/delete.
2. Create `config.ts` with `useFormSchema`, `useGridFormSchema`, `useColumns`.
3. Create `index.vue` with `useVbenVxeGrid`, `useVbenDrawer`, delete confirm.
4. Create `modules/form.vue` wired to drawer API.
5. Add route in `apps/web-antd/src/router/routes/modules/<module>.ts`.
6. Add mock handlers in `apps/backend-mock` if backend not ready.
7. Run: `pnpm -F @vben/web-antd run typecheck`

## Constraints

- Ant Design Vue only in web-antd app.
- No `list.vue` or centralized `src/api/system/`.
- Minimal diff outside new directory + route + mock.
