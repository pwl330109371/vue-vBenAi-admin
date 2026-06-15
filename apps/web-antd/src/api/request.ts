/**
 * Author: pengwenlei 330109371@qq.com
 * Date: 2026-05-20 09:41:42
 * LastEditors: pengwenlei 330109371@qq.com
 * LastEditTime: 2026-05-27 11:44:55
 */
import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { RequestClient } from '@vben/request';

import { refreshTokenApi } from './core';
import { createHttpApi } from './http/apis';
import {
  createAppRequestClient,
  createBusinessRequestClient,
  createFeishuRequestClient,
} from './http/clients';

const { apiURL, auth, userCenter } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

/**
 * 请求客户端统一导出入口。
 *
 * 具体的创建逻辑已经拆到 `api/http` 目录下：
 * - `helpers.ts`：辅助方法
 * - `interceptors.ts`：请求/响应拦截器
 * - `clients.ts`：不同类型 client 的工厂函数
 *
 * 当前文件只保留实例初始化和统一导出，方便业务侧稳定引用。
 */
export const requestClient = createAppRequestClient(
  apiURL,
  {
    responseReturn: 'data',
  },
  {
    enableRefreshToken: preferences.app.enableRefreshToken,
    refreshTokenApi,
  },
);

export const baseRequestClient = new RequestClient({ baseURL: apiURL });

export const businessRequestClient = createBusinessRequestClient(
  userCenter.apiURL,
  {
    responseReturn: 'data',
  },
  {
    channel: userCenter.channel,
    systemId: userCenter.systemId,
    withAuthGuard: true,
    withUserId: true,
  },
);

export const userCenterBaseRequestClient = createBusinessRequestClient(
  userCenter.apiURL,
  {
    responseReturn: 'data',
  },
  {
    channel: userCenter.channel,
    systemId: userCenter.systemId,
    withAuthGuard: false,
    withUserId: true,
  },
);

export const feishuRequestClient = createFeishuRequestClient(
  auth.feishu?.openApiURL || 'https://open.feishu.cn/open-apis',
  {
    responseReturn: 'data',
  },
);

export const appApi = createHttpApi(requestClient);

export const businessApi = createHttpApi(businessRequestClient);

export const authApi = createHttpApi(userCenterBaseRequestClient);

export const feishuApi = createHttpApi(feishuRequestClient);
