/**
 * HTTP 统一入口 `request`。
 *
 * 所有请求使用同一签名：request.get/post/put/delete(url, config)
 * config 中通过 service 选择后端（见 ApiServiceKey / API_SERVICE_BASE）。
 */
import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';

import { refreshTokenApi } from './core';
import { createRequest } from './http/apis';
import { API_SERVICE_BASE, createServiceClientRegistry } from './http/services';

const appConfig = useAppConfig(import.meta.env, import.meta.env.PROD);

const { getServiceClient } = createServiceClientRegistry(appConfig, {
  enableRefreshToken: preferences.app.enableRefreshToken,
  refreshTokenApi,
  responseReturn: 'data',
});

export const request = createRequest(getServiceClient);

export { API_SERVICE_BASE };
export type { RequestConfig } from './http/apis';
export type { ApiServiceKey } from './http/services';
