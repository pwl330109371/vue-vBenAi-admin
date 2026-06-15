import type { RequestClientOptions } from '@vben/request';
import type { ApplicationConfig } from '@vben/types/global';

import { RequestClient } from '@vben/request';

import {
  addAppRequestInterceptors,
  addBusinessRequestInterceptor,
  addBusinessResponseInterceptors,
  addFeishuResponseInterceptors,
} from './interceptors';

/** 后端服务标识，与 .env 中 VITE_GLOB_*_API_URL 一一对应 */
export type ApiServiceKey = 'default' | 'feishu' | 'userCenter';

/** 各服务根地址（开发环境读 import.meta.env，与 vite 代理路径一致） */
export const API_SERVICE_BASE: Record<ApiServiceKey, string> = {
  default: import.meta.env.VITE_GLOB_API_URL,
  userCenter:
    import.meta.env.VITE_GLOB_USER_CENTER_API_URL ||
    import.meta.env.VITE_GLOB_API_URL,
  feishu:
    import.meta.env.VITE_GLOB_FEISHU_OPEN_API_URL ||
    'https://open.feishu.cn/open-apis',
};

/** 由运行时配置构建服务根地址（生产环境读 window._VBEN_ADMIN_PRO_APP_CONF_） */
export function buildAPI_SERVICE_BASE(
  config: ApplicationConfig,
): Record<ApiServiceKey, string> {
  return {
    default: config.apiURL,
    userCenter: config.userCenter.apiURL,
    feishu:
      config.auth.feishu?.openApiURL || 'https://open.feishu.cn/open-apis',
  };
}

/** 获取服务 baseURL（去掉末尾斜杠） */
export function resolveServiceBaseURL(
  service: ApiServiceKey,
  appConfig?: ApplicationConfig,
): string {
  const base = appConfig
    ? buildAPI_SERVICE_BASE(appConfig)[service]
    : API_SERVICE_BASE[service];
  return base.replace(/\/$/, '');
}

export type ServiceClientOptions = {
  /** 用户中心匿名接口（登录/换票）不触发登录过期守卫 */
  skipAuthGuard?: boolean;
};

function getServiceClientKey(
  service: ApiServiceKey,
  skipAuthGuard = false,
): string {
  if (service === 'userCenter') {
    return `userCenter:${skipAuthGuard}`;
  }
  return service;
}

/**
 * 按 service 缓存 RequestClient，同一 profile 复用实例。
 */
export function createServiceClientRegistry(
  appConfig: ApplicationConfig,
  options: {
    enableRefreshToken: boolean;
    refreshTokenApi: () => Promise<any>;
    responseReturn?: RequestClientOptions['responseReturn'];
  },
) {
  const clientCache = new Map<string, RequestClient>();

  function getServiceClient(
    service: ApiServiceKey,
    clientOptions: ServiceClientOptions = {},
  ): RequestClient {
    const skipAuthGuard = clientOptions.skipAuthGuard ?? false;
    const cacheKey = getServiceClientKey(service, skipAuthGuard);

    const cached = clientCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const baseURL = resolveServiceBaseURL(service, appConfig);
    const requestOptions: RequestClientOptions = {
      baseURL,
      responseReturn: options.responseReturn ?? 'data',
    };

    let client: RequestClient;

    switch (service) {
      case 'default': {
        client = new RequestClient(requestOptions);
        addAppRequestInterceptors(client, {
          enableRefreshToken: options.enableRefreshToken,
          refreshTokenApi: options.refreshTokenApi,
        });
        break;
      }
      case 'feishu': {
        client = new RequestClient(requestOptions);
        addFeishuResponseInterceptors(client);
        break;
      }
      case 'userCenter': {
        client = new RequestClient(requestOptions);
        addBusinessRequestInterceptor(client, {
          channel: appConfig.userCenter.channel,
          systemId: appConfig.userCenter.systemId,
          withUserId: true,
        });
        addBusinessResponseInterceptors(client, !skipAuthGuard);
        break;
      }
      default: {
        client = new RequestClient(requestOptions);
        addAppRequestInterceptors(client, {
          enableRefreshToken: options.enableRefreshToken,
          refreshTokenApi: options.refreshTokenApi,
        });
        break;
      }
    }

    clientCache.set(cacheKey, client);
    return client;
  }

  return { getServiceClient };
}
