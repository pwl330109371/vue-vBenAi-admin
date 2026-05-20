/** 系统模块通用启用/禁用状态 */
export const SYSTEM_RECORD_STATUS = {
  disabled: 0,
  enabled: 1,
} as const;

export type SystemRecordStatus =
  (typeof SYSTEM_RECORD_STATUS)[keyof typeof SYSTEM_RECORD_STATUS];

export const SYSTEM_RECORD_STATUS_OPTIONS = [
  { label: '启用', value: SYSTEM_RECORD_STATUS.enabled },
  { label: '禁用', value: SYSTEM_RECORD_STATUS.disabled },
] as const;

const SYSTEM_RECORD_STATUS_LABEL: Record<SystemRecordStatus, string> = {
  [SYSTEM_RECORD_STATUS.disabled]: '禁用',
  [SYSTEM_RECORD_STATUS.enabled]: '启用',
};

export function formatSystemRecordStatus(status: SystemRecordStatus): string {
  return SYSTEM_RECORD_STATUS_LABEL[status] ?? String(status);
}
