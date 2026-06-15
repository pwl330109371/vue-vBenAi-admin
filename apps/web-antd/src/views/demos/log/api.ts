import type { Recordable } from '@vben/types';

import { request } from '#/api/request';

export namespace DemoLogApi {
  export type LogLevel = 'error' | 'info' | 'warn';

  export type LogModule = 'auth' | 'order' | 'payment' | 'system';

  export interface DemoLog {
    [key: string]: any;
    content?: string;
    createTime?: string;
    duration: number;
    id: string;
    ip: string;
    level: LogLevel;
    module: LogModule;
    operator: string;
    status: 0 | 1;
    title: string;
  }
}

/** 获取操作日志列表 */
export async function getLogList(params: Recordable<any>) {
  return request.get<Array<DemoLogApi.DemoLog>>('/demo/log/list', {
    service: 'default',
    params,
  });
}

/** 创建操作日志 */
export async function createLog(data: Omit<DemoLogApi.DemoLog, 'id'>) {
  return request.post('/demo/log', { service: 'default', data });
}

/** 更新操作日志 */
export async function updateLog(
  id: string,
  data: Omit<DemoLogApi.DemoLog, 'id'>,
) {
  return request.put(`/demo/log/${id}`, { service: 'default', data });
}

/** 删除操作日志 */
export async function deleteLog(id: string) {
  return request.delete(`/demo/log/${id}`, { service: 'default' });
}
