import type { RequestClient, RequestClientConfig } from '@vben/request';

/**
 * 轻量 HTTP 封装允许在少量场景下扩展一些前端自定义配置。
 */
export type HttpApiConfig = {
  /**
   * 是否静默错误提示。
   * 用于像退出登录这类“允许失败但不想打断用户”的请求。
   */
  ignoreErrorMessage?: boolean;
} & RequestClientConfig;

/**
 * 为 RequestClient 生成一层轻量方法封装。
 *
 * 设计目标与 label-center 类似：
 * - 业务侧优先使用 `get/post/put/delete`
 * - 第二个参数直接传常见的 params / data
 * - 第三个参数继续透传底层 RequestClientConfig，保留灵活性
 */
export function createHttpApi(client: RequestClient) {
  return {
    delete<T = any>(
      url: string,
      params?: unknown,
      config: HttpApiConfig = {},
    ): Promise<T> {
      return client.delete<T>(url, {
        ...config,
        params,
      });
    },
    get<T = any>(
      url: string,
      params?: unknown,
      config: HttpApiConfig = {},
    ): Promise<T> {
      return client.get<T>(url, {
        ...config,
        params,
      });
    },
    post<T = any>(
      url: string,
      data?: unknown,
      config: HttpApiConfig = {},
    ): Promise<T> {
      return client.post<T>(url, data, config);
    },
    put<T = any>(
      url: string,
      data?: unknown,
      config: HttpApiConfig = {},
    ): Promise<T> {
      return client.put<T>(url, data, config);
    },
  };
}
