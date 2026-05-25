---
name: vben-route-menu
description: Register vue-router routes and menu meta for web-antd. Use when adding menus or fixing 404 on new pages.
---

## Steps

1. Edit or create `apps/web-antd/src/router/routes/modules/*.ts`.
2. Use lazy import to `#/views/.../index.vue`.
3. Set meta.icon, meta.title, meta.order.
4. If access control needed, set authority per `@vben/access` patterns in `router/access.ts`.
5. Verify route name is unique.
