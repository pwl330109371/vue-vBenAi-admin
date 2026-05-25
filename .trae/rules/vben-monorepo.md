# 全局规则

- 使用简体中文与用户沟通；代码注释与变量名用英文。
- 主应用路径：`apps/web-antd`；Playground 对照：`playground`。
- 包管理器：**仅 pnpm**，禁止 npm/yarn。
- 新功能默认在 `apps/web-antd/src/views/` 下按模块建目录。
- 修改后必须执行：`pnpm -F @vben/web-antd run typecheck`；大范围改动再跑 `pnpm lint`。
- 遵循 `@vben/eslint-config`；不要引入项目未使用的 UI 库（本仓库为 Ant Design Vue）。
- 不创建用户未要求的 Markdown 文档。
- 不提交 git，除非用户明确要求。
- 最小 diff：不重构无关文件。
