import type {
  ApplicationConfig,
  VbenAdminProAppConfigRaw,
} from '@vben/types/global';

/**
 * 由 vite-inject-app-config 注入的全局配置
 */
export function useAppConfig(
  env: Record<string, any>,
  isProduction: boolean,
): ApplicationConfig {
  // 生产环境下，直接使用 window._VBEN_ADMIN_PRO_APP_CONF_ 全局变量
  const config = isProduction
    ? window._VBEN_ADMIN_PRO_APP_CONF_
    : (env as VbenAdminProAppConfigRaw);

  const {
    VITE_GLOB_API_URL,
    VITE_GLOB_AUTH_DINGDING_CORP_ID,
    VITE_GLOB_AUTH_DINGDING_CLIENT_ID,
    VITE_GLOB_FEISHU_APP_ID,
    VITE_GLOB_FEISHU_APP_SECRET,
    VITE_GLOB_FEISHU_OPEN_API_URL,
    VITE_GLOB_FEISHU_REDIRECT_URL,
    VITE_GLOB_USER_CENTER_API_URL,
    VITE_GLOB_USER_CENTER_CHANNEL,
    VITE_GLOB_USER_CENTER_LOGIN_AES_KEY,
    VITE_GLOB_USER_CENTER_SYSTEM_ID,
  } = config;

  const applicationConfig: ApplicationConfig = {
    apiURL: VITE_GLOB_API_URL,
    auth: {},
    userCenter: {
      apiURL: VITE_GLOB_USER_CENTER_API_URL || VITE_GLOB_API_URL,
      channel: VITE_GLOB_USER_CENTER_CHANNEL || 'web',
      loginAesKey: VITE_GLOB_USER_CENTER_LOGIN_AES_KEY || 'GViX2lkr7oQNS9tK',
      systemId: VITE_GLOB_USER_CENTER_SYSTEM_ID || '',
    },
  };
  if (VITE_GLOB_AUTH_DINGDING_CORP_ID && VITE_GLOB_AUTH_DINGDING_CLIENT_ID) {
    applicationConfig.auth.dingding = {
      clientId: VITE_GLOB_AUTH_DINGDING_CLIENT_ID,
      corpId: VITE_GLOB_AUTH_DINGDING_CORP_ID,
    };
  }
  if (
    VITE_GLOB_FEISHU_APP_ID &&
    VITE_GLOB_FEISHU_APP_SECRET &&
    VITE_GLOB_FEISHU_REDIRECT_URL
  ) {
    applicationConfig.auth.feishu = {
      appId: VITE_GLOB_FEISHU_APP_ID,
      appSecret: VITE_GLOB_FEISHU_APP_SECRET,
      openApiURL:
        VITE_GLOB_FEISHU_OPEN_API_URL || 'https://open.feishu.cn/open-apis',
      redirectURL: VITE_GLOB_FEISHU_REDIRECT_URL,
    };
  }

  return applicationConfig;
}
