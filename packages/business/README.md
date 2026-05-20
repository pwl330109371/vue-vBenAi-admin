# @vben/business

跨业务模块共享的逻辑与常量，供 `apps/web-antd` 等业务应用引用。

## 使用

```ts
import { SYSTEM_RECORD_STATUS, formatSystemRecordStatus } from '@vben/business';
```

## 约定

- 仅放置与 UI 库无关的纯逻辑（常量、枚举、工具函数、类型）
- 页面、路由、API 请求仍放在 `apps/web-antd`
