import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

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
  return requestClient.get<Array<DemoLogApi.DemoLog>>('/demo/log/list', {
    params,
  });
}

/** 创建操作日志 */
export async function createLog(data: Omit<DemoLogApi.DemoLog, 'id'>) {
  return requestClient.post('/demo/log', data);
}

/** 更新操作日志 */
export async function updateLog(
  id: string,
  data: Omit<DemoLogApi.DemoLog, 'id'>,
) {
  return requestClient.put(`/demo/log/${id}`, data);
}

/** 删除操作日志 */
export async function deleteLog(id: string) {
  return requestClient.delete(`/demo/log/${id}`);
}
