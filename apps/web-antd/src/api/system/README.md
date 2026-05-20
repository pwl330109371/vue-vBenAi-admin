# 业务 API

系统管理接口对接 `backend-mock` 或真实后端，路径前缀 `/system/*`。

生产环境请在 `.env.production` 配置 `VITE_GLOB_API_URL`，并设置 `VITE_NITRO_MOCK=false`。

权限菜单由 `GET /menu/all` 返回，`preferences.app.accessMode` 为 `backend` 时由后端驱动路由。
