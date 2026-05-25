---
paths:
  - 'apps/web-antd/src/views/**/*'
---

# CRUD Views 规则（vue-pages + api-layer 要点）

## Vue 页面

- 必须使用 `<script lang="ts" setup>`。
- 列表页优先 `useVbenVxeGrid` + `Page` 布局组件。
- 表单弹层优先 `useVbenDrawer` 或 `useVbenModal`，`destroyOnClose: true`。
- 删除、批量操作必须 `Modal.confirm` 二次确认。
- 提交按钮需防重复：loading 态或节流。
- 操作列通过 `useColumns(onActionClick)` 配置。
- 从 `config.ts` 导出 schema/columns，不在 `index.vue` 写大段列定义。

## API 层

- 使用 `export namespace XxxApi { export interface ... }` 定义类型。
- 请求统一 `import { requestClient } from '#/api/request'`。
- 导出函数命名：`getXxxList` / `createXxx` / `updateXxx` / `deleteXxx`。
- 不在 views 里直接写裸 `fetch` 或 `axios`。

## 目录结构（金标准）

```
views/<module>/<feature>/
├── api.ts
├── config.ts
├── index.vue
└── modules/form.vue
```

参考：`apps/web-antd/src/views/system/user/`
