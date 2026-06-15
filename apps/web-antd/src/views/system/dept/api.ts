import { request } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/** 获取部门列表数据 */
export async function getDeptList() {
  return request.get<Array<SystemDeptApi.SystemDept>>('/system/dept/list', {
    service: 'default',
  });
}

/** 创建部门 */
export async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return request.post('/system/dept', { service: 'default', data });
}

/** 更新部门 */
export async function updateDept(
  id: string,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return request.put(`/system/dept/${id}`, { service: 'default', data });
}

/** 删除部门 */
export async function deleteDept(id: string) {
  return request.delete(`/system/dept/${id}`, { service: 'default' });
}
