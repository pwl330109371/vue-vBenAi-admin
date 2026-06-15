import type { Recordable } from '@vben/types';

import { request } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/** 获取用户列表数据 */
export async function getUserList(params: Recordable<any>) {
  return request.get<Array<SystemUserApi.SystemUser>>('/system/user/list', {
    service: 'default',
    params,
  });
}

/** 创建用户 */
export async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return request.post('/system/user', { service: 'default', data });
}

/** 更新用户 */
export async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return request.put(`/system/user/${id}`, { service: 'default', data });
}

/** 删除用户 */
export async function deleteUser(id: string) {
  return request.delete(`/system/user/${id}`, { service: 'default' });
}
