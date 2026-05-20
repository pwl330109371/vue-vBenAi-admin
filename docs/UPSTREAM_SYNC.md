# 上游同步指南

本仓库基于 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 定制，请按以下方式管理 Git 远程与同步。

## 远程仓库约定

| 远程名 | 用途 | 默认地址 |
|--------|------|----------|
| `origin` | 公司/团队私有仓库（请自行替换） | 由你创建后配置 |
| `upstream` | 官方上游，仅用于拉取更新 | `https://github.com/vbenjs/vue-vben-admin.git` |

### 首次 Fork 后配置

```bash
# 若 origin 仍指向官方仓库，可先重命名为 upstream
git remote rename origin upstream

# 添加公司仓库为 origin
git remote add origin http://gitlab.yuepong.cn/pengwenlei/vue3-admin-template.git

# 推送并设置默认上游分支
git push -u origin main
```

### 仅添加上游（保留现有 origin）

```bash
git remote add upstream https://github.com/vbenjs/vue-vben-admin.git
git fetch upstream
```

## 同步官方更新

```bash
git fetch upstream
git checkout main
git merge upstream/main
# 解决冲突后
pnpm install
pnpm check
```

## 减少冲突的建议

- 业务代码放在 `apps/web-antd/` 与 `packages/business/`
- 避免修改 `packages/@core/`、`packages/effects/` 源码
- 定制优先使用 `preferences.ts`、`api/request.ts`、adapter 目录
