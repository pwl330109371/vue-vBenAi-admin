import type { RequestClient } from '@vben/request';

import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
} from '@vben/request';
import { useAccessStore, useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import {
  doReAuthenticate,
  doRefreshToken,
  formatToken,
  isBusinessSuccessCode,
  isUserCenterAuthExpired,
} from './helpers';

function getResponseErrorMessage(error: any) {
  const responseData = error?.response?.data ?? {};
  return (
    responseData?.error ?? responseData?.msg ?? responseData?.message ?? ''
  );
}

/**
 * 允许调用方按请求粒度关闭默认错误提示。
 */
function shouldIgnoreErrorMessage(error: any) {
  return Boolean(error?.config?.ignoreErrorMessage);
}

/**
 * 默认项目接口拦截器：
 * 适用于 vben 风格接口和本地 mock，成功码固定为 `0`。
 */
export function addAppRequestInterceptors(
  client: RequestClient,
  options: {
    enableRefreshToken: boolean;
    refreshTokenApi: () => Promise<any>;
  },
) {
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = 'zh-CN';
      return config;
    },
  });

  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  );

  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken: async () => doRefreshToken(options.refreshTokenApi),
      enableRefreshToken: options.enableRefreshToken,
      formatToken,
    }),
  );

  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      if (shouldIgnoreErrorMessage(error)) {
        return;
      }
      message.error(getResponseErrorMessage(error) || msg);
    }),
  );
}

/**
 * 业务系统通用请求头：
 * 统一注入 token、语言、systemId、channel 和可选的 userId。
 */
export function addBusinessRequestInterceptor(
  client: RequestClient,
  options: {
    channel?: string;
    systemId?: string;
    withUserId?: boolean;
  } = {},
) {
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const userStore = useUserStore();
      const headers = (config.headers ?? {}) as Record<string, any>;

      headers.Authorization = formatToken(accessStore.accessToken);
      headers['Accept-Language'] = 'zh-CN';

      if (options.channel) {
        headers.channel = options.channel;
      }
      if (options.systemId) {
        headers.systemId = options.systemId;
      }
      if (options.withUserId && userStore.userInfo?.username) {
        headers.userId = userStore.userInfo.username;
      }

      config.headers = headers as any;
      return config;
    },
  });
}

/**
 * 用户中心 / 签宝类接口响应拦截器：
 * - 成功规则按业务码判断
 * - 可选开启登录过期守卫
 */
export function addBusinessResponseInterceptors(
  client: RequestClient,
  withAuthGuard: boolean,
) {
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: (responseData) => responseData?.data ?? responseData,
      successCode: isBusinessSuccessCode,
    }),
  );

  if (withAuthGuard) {
    client.addResponseInterceptor(
      authenticateResponseInterceptor({
        client,
        doReAuthenticate,
        doRefreshToken: async () => '',
        enableRefreshToken: false,
        formatToken,
      }),
    );

    client.addResponseInterceptor({
      rejected: async (error: any) => {
        if (isUserCenterAuthExpired(error)) {
          await doReAuthenticate();
        }
        throw error;
      },
    });
  }

  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      if (shouldIgnoreErrorMessage(error)) {
        return;
      }
      message.error(getResponseErrorMessage(error) || msg);
    }),
  );
}

/**
 * 飞书接口的响应结构和业务系统不同，单独处理成功码与错误消息。
 */
export function addFeishuResponseInterceptors(client: RequestClient) {
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: (responseData) => responseData?.data ?? responseData,
      successCode: (code) => code === undefined || code === 0,
    }),
  );

  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      if (shouldIgnoreErrorMessage(error)) {
        return;
      }
      message.error(getResponseErrorMessage(error) || msg);
    }),
  );
}
