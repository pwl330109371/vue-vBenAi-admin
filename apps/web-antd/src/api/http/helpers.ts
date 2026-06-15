import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { useAuthStore } from '#/store';

/**
 * 统一补齐 Bearer token 格式，避免各个拦截器重复拼接。
 */
export function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

/**
 * 业务后端的成功码规则：
 * - 未返回 code 时默认按成功处理
 * - 返回值前 3 位为 200 时视为成功
 */
export function isBusinessSuccessCode(
  code: null | number | string | undefined,
) {
  if (code === undefined || code === null || code === '') {
    return true;
  }
  return Number.parseInt(String(code).slice(0, 3), 10) === 200;
}

/**
 * 用户中心部分接口会用业务码而不是原生 HTTP 401 表示登录过期。
 */
export function isUserCenterAuthExpired(error: any) {
  const responseData = error?.response?.data ?? error ?? {};
  const rawCode = responseData?.code;
  const normalizedCode = Number.parseInt(String(rawCode ?? '').slice(0, 3), 10);
  const messageText = String(
    responseData?.error ?? responseData?.msg ?? responseData?.message ?? '',
  );

  return (
    normalizedCode === 401 ||
    /登录状态已过期|token.*expired|unauthorized/i.test(messageText)
  );
}

/**
 * 清空鉴权态并进入项目当前配置的重新登录流程。
 */
export async function doReAuthenticate() {
  const accessStore = useAccessStore();
  const authStore = useAuthStore();
  accessStore.setAccessToken(null);

  if (
    preferences.app.loginExpiredMode === 'modal' &&
    accessStore.isAccessChecked
  ) {
    accessStore.setLoginExpired(true);
  } else {
    await authStore.logout();
  }
}

/**
 * 默认接口支持 refresh token，这里统一维护刷新逻辑。
 */
export async function doRefreshToken(refreshTokenApi: () => Promise<any>) {
  const accessStore = useAccessStore();
  const resp = await refreshTokenApi();
  const newToken = resp.data;
  accessStore.setAccessToken(newToken);
  return newToken;
}
