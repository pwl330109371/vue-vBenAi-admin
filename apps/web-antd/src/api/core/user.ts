import type { UserInfo } from '@vben/types';

import type { UserCenterRawUserInfo } from './user-center-adapter';

import { request } from '#/api/request';

import { normalizeUserInfo } from './user-center-adapter';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const userInfo = await request.get<UserCenterRawUserInfo>(
    '/ability/user/getInfo',
    { service: 'userCenter' },
  );

  return normalizeUserInfo(userInfo) as UserInfo & {
    accessCodes?: string[];
    rawUserInfo?: UserCenterRawUserInfo;
  };
}
