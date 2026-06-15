import type { Recordable } from '@vben/types';

import { request } from '#/api/request';

export namespace SystemMenuApi {
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;

  export const BadgeTypes = ['dot', 'normal'] as const;

  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;

  export interface SystemMenu {
    [key: string]: any;
    authCode: string;
    children?: SystemMenu[];
    component?: string;
    id: string;
    meta?: {
      activeIcon?: string;
      activePath?: string;
      affixTab?: boolean;
      affixTabOrder?: number;
      badge?: string;
      badgeType?: (typeof BadgeTypes)[number];
      badgeVariants?: (typeof BadgeVariants)[number];
      hideChildrenInMenu?: boolean;
      hideInBreadcrumb?: boolean;
      hideInMenu?: boolean;
      hideInTab?: boolean;
      icon?: string;
      iframeSrc?: string;
      keepAlive?: boolean;
      link?: string;
      maxNumOfOpenTab?: number;
      noBasicLayout?: boolean;
      openInNewWindow?: boolean;
      order?: number;
      query?: Recordable<any>;
      title?: string;
    };
    name: string;
    path: string;
    pid: string;
    redirect?: string;
    type: (typeof MenuTypes)[number];
  }
}

/** 获取菜单数据列表 */
export async function getMenuList() {
  return request.get<Array<SystemMenuApi.SystemMenu>>('/system/menu/list', {
    service: 'default',
  });
}

export async function isMenuNameExists(
  name: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return request.get<boolean>('/system/menu/name-exists', {
    service: 'default',
    params: { id, name },
  });
}

export async function isMenuPathExists(
  path: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return request.get<boolean>('/system/menu/path-exists', {
    service: 'default',
    params: { id, path },
  });
}

/** 创建菜单 */
export async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return request.post('/system/menu', { service: 'default', data });
}

/** 更新菜单 */
export async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return request.put(`/system/menu/${id}`, { service: 'default', data });
}

/** 删除菜单 */
export async function deleteMenu(id: string) {
  return request.delete(`/system/menu/${id}`, { service: 'default' });
}
