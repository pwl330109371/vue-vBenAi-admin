import type { Recordable } from '@vben/types';

import { request } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/** 获取角色列表数据 */
export async function getRoleList(params: Recordable<any>) {
  return request.get<Array<SystemRoleApi.SystemRole>>('/system/role/list', {
    service: 'default',
    params,
  });
}

/** 创建角色 */
export async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return request.post('/system/role', { service: 'default', data });
}

/** 更新角色 */
export async function updateRole(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return request.put(`/system/role/${id}`, { service: 'default', data });
}

/** 删除角色 */
export async function deleteRole(id: string) {
  return request.delete(`/system/role/${id}`, { service: 'default' });
}
