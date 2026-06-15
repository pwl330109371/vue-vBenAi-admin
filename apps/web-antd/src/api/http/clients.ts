import type { RequestClientOptions } from '@vben/request';

import { RequestClient } from '@vben/request';

import {
  addAppRequestInterceptors,
  addBusinessRequestInterceptor,
  addBusinessResponseInterceptors,
  addFeishuResponseInterceptors,
} from './interceptors';

/**
 * 创建默认应用客户端：
 * 用于项目默认接口和本地 mock。
 */
export function createAppRequestClient(
  baseURL: string,
  options: RequestClientOptions | undefined,
  config: {
    enableRefreshToken: boolean;
    refreshTokenApi: () => Promise<any>;
  },
) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  addAppRequestInterceptors(client, config);

  return client;
}

/**
 * 创建统一业务客户端：
 * 用于用户中心、签宝等共用一套鉴权协议的接口。
 */
export function createBusinessRequestClient(
  baseURL: string,
  options: RequestClientOptions | undefined,
  config: {
    channel?: string;
    systemId?: string;
    withAuthGuard: boolean;
    withUserId?: boolean;
  },
) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  addBusinessRequestInterceptor(client, {
    channel: config.channel,
    systemId: config.systemId,
    withUserId: config.withUserId,
  });
  addBusinessResponseInterceptors(client, config.withAuthGuard);

  return client;
}

/**
 * 创建飞书客户端：
 * 只负责飞书开放平台这一类特殊响应结构的接口。
 */
export function createFeishuRequestClient(
  baseURL: string,
  options?: RequestClientOptions,
) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  addFeishuResponseInterceptors(client);

  return client;
}
