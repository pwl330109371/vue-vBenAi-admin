import { useAppConfig } from '@vben/hooks';

import { authApi, feishuApi } from '#/api/request';

import { normalizeAccessToken } from './user-center-adapter';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    code: string;
    password?: string;
    systemId?: string;
    username?: string;
    uuid?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  export interface MobileLoginParams {
    mobile: string;
    smsCode: string;
    systemId?: string;
  }

  export interface FeishuUserAccessTokenResult {
    access_token: string;
  }

  export interface GetCaptchaResult {
    img: string;
    uuid: string;
  }

  export interface SmsCodeResult {
    [key: string]: any;
  }
}

const {
  auth,
  userCenter: { systemId },
} = useAppConfig(import.meta.env, import.meta.env.PROD);

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const response = await authApi.post('/auth/loginWithEncode', {
    ...data,
    systemId: data.systemId || systemId,
  });

  return {
    accessToken: normalizeAccessToken(response),
  };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return {
    data: '',
    status: 200,
  };
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return authApi.get('/user/logout', undefined, {
    // 当前部分联调环境未提供注销接口，失败时不需要额外打断用户。
    ignoreErrorMessage: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return [];
}

/**
 * 获取图形验证码
 */
export async function getCaptchaApi() {
  return authApi.get<AuthApi.GetCaptchaResult>('/code');
}

/**
 * 获取短信验证码
 */
export async function sendSmsCodeApi(mobile: string) {
  return authApi.get<AuthApi.SmsCodeResult>('/smsCode', {
    mobile,
  });
}

/**
 * 手机号登录
 */
export async function mobileLoginApi(data: AuthApi.MobileLoginParams) {
  const response = await authApi.post('/auth/mobile', {
    ...data,
    systemId: data.systemId || systemId,
  });

  return {
    accessToken: normalizeAccessToken(response),
  };
}

/**
 * 飞书应用 access token
 */
export async function getFeishuAppAccessTokenApi() {
  return feishuApi.post('/auth/v3/app_access_token/internal', {
    app_id: auth.feishu?.appId,
    app_secret: auth.feishu?.appSecret,
  });
}

/**
 * 飞书用户 access token
 */
export async function getFeishuUserAccessTokenApi(code: string) {
  const appAccessToken = await getFeishuAppAccessTokenApi();

  return feishuApi.post<AuthApi.FeishuUserAccessTokenResult>(
    '/authen/v1/oidc/access_token',
    {
      code,
      grant_type: 'authorization_code',
    },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken.app_access_token}`,
      },
    },
  );
}

/**
 * 飞书登录换取用户中心 token
 */
export async function feishuLoginApi(code: string) {
  const { access_token } = await getFeishuUserAccessTokenApi(code);
  const response = await authApi.post('/auth/feishuLogin', {
    accessToken: access_token,
    systemId,
  });

  return {
    accessToken: normalizeAccessToken(response),
  };
}
