import { useAppConfig } from '@vben/hooks';

import { request } from '#/api/request';

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
  const response = await request.post('/auth/loginWithEncode', {
    service: 'userCenter',
    skipAuthGuard: true,
    data: {
      ...data,
      systemId: data.systemId || systemId,
    },
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
  return request.get('/user/logout', {
    service: 'userCenter',
    skipAuthGuard: true,
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
  return request.get<AuthApi.GetCaptchaResult>('/code', {
    service: 'userCenter',
    skipAuthGuard: true,
  });
}

/**
 * 获取短信验证码
 */
export async function sendSmsCodeApi(mobile: string) {
  return request.get<AuthApi.SmsCodeResult>('/smsCode', {
    service: 'userCenter',
    skipAuthGuard: true,
    params: { mobile },
  });
}

/**
 * 手机号登录
 */
export async function mobileLoginApi(data: AuthApi.MobileLoginParams) {
  const response = await request.post('/auth/mobile', {
    service: 'userCenter',
    skipAuthGuard: true,
    data: {
      ...data,
      systemId: data.systemId || systemId,
    },
  });

  return {
    accessToken: normalizeAccessToken(response),
  };
}

/**
 * 飞书应用 access token
 */
export async function getFeishuAppAccessTokenApi() {
  return request.post('/auth/v3/app_access_token/internal', {
    service: 'feishu',
    data: {
      app_id: auth.feishu?.appId,
      app_secret: auth.feishu?.appSecret,
    },
  });
}

/**
 * 飞书用户 access token
 */
export async function getFeishuUserAccessTokenApi(code: string) {
  const appAccessToken = await getFeishuAppAccessTokenApi();

  return request.post<AuthApi.FeishuUserAccessTokenResult>(
    '/authen/v1/oidc/access_token',
    {
      service: 'feishu',
      data: {
        code,
        grant_type: 'authorization_code',
      },
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
  const response = await request.post('/auth/feishuLogin', {
    service: 'userCenter',
    skipAuthGuard: true,
    data: {
      accessToken: access_token,
      systemId,
    },
  });

  return {
    accessToken: normalizeAccessToken(response),
  };
}
