---
name: vben-antd-interaction
description: Vue + Ant Design Vue 中后台交互规范，适配 frontend-interaction-guide 到 web-antd。Use when building or reviewing admin pages, CRUD forms, table lists, dialogs in apps/web-antd.
---

# 中后台交互规范（Ant Design Vue 版）

编写 `apps/web-antd` 页面时，遵循 `frontend-interaction-guide` 的 20 条交互原则，API 映射如下。

## Element Plus → Ant Design Vue 映射

| 规范 | Element Plus | Ant Design Vue / Vben |
| --- | --- | --- |
| 表格加载 | `v-loading` | VxeGrid `loading` 或 `useVbenVxeGrid` 内置 |
| 确认框 | `ElMessageBox.confirm` | `Modal.confirm` |
| 消息 | `ElMessage.success` | `message.success` |
| 弹窗遮罩 | `:close-on-click-modal="false"` | `:mask-closable="false"` |
| 表单校验 | `formRef.validate()` | `formApi.validate()` |
| 空状态 | `<el-empty>` | 表格 `#empty` 或 Ant Design `Empty` |
| 操作列固定 | `fixed="right"` | VxeTable column `fixed: 'right'` |
| 文本省略 | `show-overflow-tooltip` | column `showOverflow: 'tooltip'` |

## 核心约束（与 global 规则一致）

- 列表页：`useVbenVxeGrid` + `Page`；列定义放 `config.ts`。
- 删除/批量：必须 `Modal.confirm`。
- 提交：loading 防重复。
- 抽屉/弹窗：`destroyOnClose: true`，`:mask-closable="false"`。
- 参考实现：`apps/web-antd/src/views/system/user/`。

## 详细示例

个人 skill `frontend-interaction-guide` 的完整 20 条见 `~/.cursor/skills/frontend-interaction-guide/SKILL.md`，实现时按上表替换 API。
