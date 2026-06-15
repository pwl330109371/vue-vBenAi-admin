import type { RequestClient, RequestClientConfig } from '@vben/request';

import type { ApiServiceKey, ServiceClientOptions } from './services';

/**
 * 统一请求配置：通过 service 选择 baseURL 与拦截器策略。
 * get/delete 使用 params；post/put 使用 data。
 */
export type RequestConfig = {
  data?: unknown;
  /** 是否静默错误提示 */
  ignoreErrorMessage?: boolean;
  params?: unknown;
  /** 后端服务标识 */
  service: ApiServiceKey;
  /** 用户中心匿名接口不触发登录过期守卫 */
  skipAuthGuard?: boolean;
} & Omit<RequestClientConfig, 'data' | 'params'>;

type ServiceClientGetter = (
  service: ApiServiceKey,
  options?: ServiceClientOptions,
) => RequestClient;

function resolveClient(
  getClient: ServiceClientGetter,
  config: RequestConfig,
): RequestClient {
  return getClient(config.service, {
    skipAuthGuard: config.skipAuthGuard,
  });
}

function toClientConfig(config: RequestConfig): RequestClientConfig {
  const {
    service: _service,
    skipAuthGuard: _skip,
    data: _data,
    ...rest
  } = config;
  return rest;
}

export interface AppRequest {
  delete<T = any>(url: string, config: RequestConfig): Promise<T>;
  get<T = any>(url: string, config: RequestConfig): Promise<T>;
  post<T = any>(url: string, config: RequestConfig): Promise<T>;
  put<T = any>(url: string, config: RequestConfig): Promise<T>;
}

/**
 * 创建统一 request API：所有方法签名一致 request.get(url, config)。
 */
export function createRequest(getClient: ServiceClientGetter): AppRequest {
  return {
    delete<T = any>(url: string, config: RequestConfig): Promise<T> {
      const client = resolveClient(getClient, config);
      return client.delete<T>(url, toClientConfig(config));
    },
    get<T = any>(url: string, config: RequestConfig): Promise<T> {
      const client = resolveClient(getClient, config);
      return client.get<T>(url, toClientConfig(config));
    },
    post<T = any>(url: string, config: RequestConfig): Promise<T> {
      const client = resolveClient(getClient, config);
      return client.post<T>(url, config.data, toClientConfig(config));
    },
    put<T = any>(url: string, config: RequestConfig): Promise<T> {
      const client = resolveClient(getClient, config);
      return client.put<T>(url, config.data, toClientConfig(config));
    },
  };
}
