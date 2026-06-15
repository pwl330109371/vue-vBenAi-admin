import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  feishuLoginApi,
  getAllMenusApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  mobileLoginApi,
} from '#/api';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const mobileLoginLoading = ref(false);
  const qrcodeLoginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi({
        code: String(params.code ?? ''),
        password: String(params.password ?? ''),
        username: String(params.username ?? ''),
        uuid: String(params.uuid ?? ''),
      });

      return await completeLogin(accessToken, onSuccess);
    } finally {
      loginLoading.value = false;
    }
  }

  async function authLoginByMobile(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      mobileLoginLoading.value = true;
      const { accessToken } = await mobileLoginApi({
        mobile: params.mobile,
        smsCode: params.smsCode,
      });

      return await completeLogin(accessToken, onSuccess);
    } finally {
      mobileLoginLoading.value = false;
    }
  }

  async function authLoginByFeishuCode(
    code: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      qrcodeLoginLoading.value = true;
      const { accessToken } = await feishuLoginApi(code);

      return await completeLogin(accessToken, onSuccess);
    } finally {
      qrcodeLoginLoading.value = false;
    }
  }

  async function logout(redirect: boolean = true) {
    try {
      // 先通知后端注销当前会话；如果后端未提供接口，也不阻断前端退出流程。
      await logoutApi();
    } catch {
      // 旧项目也是“接口失败仍然清理本地登录态”，这里保持同样策略。
    }

    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = (await getUserInfoApi()) as UserInfo & {
      accessCodes?: string[];
    };
    accessStore.setAccessCodes(userInfo.accessCodes || []);
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  async function completeLogin(
    accessToken: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;

    if (!accessToken) {
      return {
        userInfo,
      };
    }

    accessStore.setAccessToken(accessToken);
    const [fetchUserInfoResult] = await Promise.all([
      fetchUserInfo(),
      getAllMenusApi(),
    ]);

    userInfo = fetchUserInfoResult;

    const homePath = preferences.app.defaultHomePath;

    if (userInfo.homePath !== homePath) {
      userStore.setUserInfo({
        ...userInfo,
        homePath,
      });
      userInfo = {
        ...userInfo,
        homePath,
      };
    }

    if (accessStore.loginExpired) {
      accessStore.setLoginExpired(false);
    } else {
      onSuccess ? await onSuccess?.() : await router.push(homePath);
    }

    if (userInfo?.realName) {
      notification.success({
        description: `${'欢迎回来'}:${userInfo.realName}`,
        duration: 3,
        message: '登录成功',
      });
    }

    return {
      userInfo,
    };
  }

  function $reset() {
    loginLoading.value = false;
    mobileLoginLoading.value = false;
    qrcodeLoginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    authLoginByFeishuCode,
    authLoginByMobile,
    fetchUserInfo,
    loginLoading,
    mobileLoginLoading,
    logout,
    qrcodeLoginLoading,
  };
});
