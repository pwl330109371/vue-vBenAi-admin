import type { RouteRecordStringComponent } from '@vben/types';

import type { UserCenterRawMenuRoute } from './user-center-adapter';

import { useAppConfig } from '@vben/hooks';

import { businessApi } from '#/api/request';

import { normalizeMenuRoutes } from './user-center-adapter';

const {
  userCenter: { systemId },
} = useAppConfig(import.meta.env, import.meta.env.PROD);

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  const routes = await businessApi.get<UserCenterRawMenuRoute[]>(
    `/server/menu/getRouters/${systemId}`,
  );

  return normalizeMenuRoutes(routes) as RouteRecordStringComponent[];
}
