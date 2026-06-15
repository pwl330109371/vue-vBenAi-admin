import type { RouteMeta as IRouteMeta } from '@vben-core/typings';

import 'vue-router';

declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteMeta extends IRouteMeta {}
}

export interface VbenAdminProAppConfigRaw {
  VITE_GLOB_API_URL: string;
  VITE_GLOB_AUTH_DINGDING_CLIENT_ID: string;
  VITE_GLOB_AUTH_DINGDING_CORP_ID: string;
  VITE_GLOB_FEISHU_APP_ID: string;
  VITE_GLOB_FEISHU_APP_SECRET: string;
  VITE_GLOB_FEISHU_OPEN_API_URL: string;
  VITE_GLOB_FEISHU_REDIRECT_URL: string;
  VITE_GLOB_USER_CENTER_API_URL: string;
  VITE_GLOB_USER_CENTER_CHANNEL: string;
  VITE_GLOB_USER_CENTER_LOGIN_AES_KEY: string;
  VITE_GLOB_USER_CENTER_SYSTEM_ID: string;
}

interface AuthConfig {
  dingding?: {
    clientId: string;
    corpId: string;
  };
  feishu?: {
    appId: string;
    appSecret: string;
    openApiURL: string;
    redirectURL: string;
  };
}

export interface ApplicationConfig {
  apiURL: string;
  auth: AuthConfig;
  userCenter: {
    apiURL: string;
    channel: string;
    loginAesKey: string;
    systemId: string;
  };
}

declare global {
  interface Window {
    _VBEN_ADMIN_PRO_APP_CONF_: VbenAdminProAppConfigRaw;
  }
}
