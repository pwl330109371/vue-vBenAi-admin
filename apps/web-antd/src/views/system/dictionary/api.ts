import type { UserInfo } from '@vben/types';

import { useUserStore } from '@vben/stores';

import { businessApi } from '#/api/request';

export namespace SystemDictionaryApi {
  export type UseStatus = 0 | 1;

  export interface Dictionary {
    [key: string]: any;
    createTime?: string;
    dictionaryCode: string;
    dictionaryName: string;
    id: string;
    list?: DictionaryItemValue[];
    remark?: string;
    updateTime?: string;
    useStatus: UseStatus;
  }

  export interface DictionaryItemValue {
    [key: string]: any;
    createTime?: string;
    dictionaryCode: string;
    id: string;
    itemValue: string;
    itemValueName: string;
    remark?: string;
    updateTime?: string;
    useStatus: UseStatus;
  }

  export interface DictionaryListQuery {
    dictionaryCode?: string;
    dictionaryName?: string;
    pageNum: number;
    pageSize: number;
  }

  export interface DictionaryListResult {
    items: Dictionary[];
    total: number;
  }

  export interface DictionaryForm {
    dictionaryCode: string;
    dictionaryName: string;
    useStatus: UseStatus;
  }

  export interface DictionaryExistsParams {
    dictionaryCode?: string;
    dictionaryName?: string;
    id?: string;
  }

  export interface DictionaryItemValueListQuery {
    code: string;
    itemValue?: string;
    itemValueName?: string;
    pageIndex?: number;
    pageSize?: number;
    useStatus?: UseStatus;
  }

  export interface DictionaryItemValueForm {
    dictionaryCode: string;
    itemValue: string;
    itemValueName: string;
    remark?: string;
    useStatus: UseStatus;
  }

  export interface DictionaryItemValueExistsParams {
    dictionaryCode: string;
    id?: string;
    itemValue?: string;
    itemValueName?: string;
  }
}

export type Dictionary = SystemDictionaryApi.Dictionary;
export type DictionaryExistsParams = SystemDictionaryApi.DictionaryExistsParams;
export type DictionaryForm = SystemDictionaryApi.DictionaryForm;
export type DictionaryItemValue = SystemDictionaryApi.DictionaryItemValue;
export type DictionaryItemValueExistsParams =
  SystemDictionaryApi.DictionaryItemValueExistsParams;
export type DictionaryItemValueForm =
  SystemDictionaryApi.DictionaryItemValueForm;
export type DictionaryItemValueListQuery =
  SystemDictionaryApi.DictionaryItemValueListQuery;
export type DictionaryListQuery = SystemDictionaryApi.DictionaryListQuery;
export type DictionaryListResult = SystemDictionaryApi.DictionaryListResult;
export type UseStatus = SystemDictionaryApi.UseStatus;

type UserCenterListBody<T> = {
  code?: number | string;
  data?:
    | T[]
    | {
        data?: T[];
        items?: T[];
        total?: number | string;
      };
  message?: string;
  rows?: T[];
  total?: number | string;
};

/**
 * 兼容旧项目的数据范围默认值：
 * - companyCode 优先取本地缓存，没有则回退到旧项目默认企业编码
 * - organCode 沿用旧项目固定组织编码
 */
const FALLBACK_COMPANY_CODE = '0001';
const FALLBACK_ORGAN_CODE = '001';

/**
 * 读取本地缓存中的业务字段。
 * 旧项目通过 cache.local.getJSON('companyCode') 读取，这里兼容：
 * - 纯字符串
 * - JSON 字符串
 */
function getStorageStringValue(key: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return '';
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return typeof parsedValue === 'string'
      ? parsedValue
      : String(parsedValue ?? '');
  } catch {
    return rawValue;
  }
}

function getOptionalBizParams() {
  const userStore = useUserStore();
  const userInfo = (userStore.userInfo ?? {}) as UserInfo & {
    companyCode?: string;
    organCode?: string;
    rawUserInfo?: Record<string, any>;
  };
  const rawUserInfo = userInfo.rawUserInfo ?? {};
  const companyCode = String(
    rawUserInfo.companyCode ||
      userInfo.companyCode ||
      getStorageStringValue('companyCode') ||
      FALLBACK_COMPANY_CODE,
  );
  const organCode = String(
    rawUserInfo.organCode ||
      userInfo.organCode ||
      getStorageStringValue('organCode') ||
      FALLBACK_ORGAN_CODE,
  );

  return {
    companyCode,
    organCode,
  };
}

function getOptionalCreator() {
  const userStore = useUserStore();
  const userInfo = (userStore.userInfo ?? {}) as UserInfo;

  return userInfo.userId ? { createBy: userInfo.userId } : {};
}

function normalizeStatus(value: unknown): SystemDictionaryApi.UseStatus {
  return Number.parseInt(String(value ?? 0), 10) === 1 ? 1 : 0;
}

function normalizeDictionary(
  record: Record<string, any>,
): SystemDictionaryApi.Dictionary {
  return {
    ...record,
    dictionaryCode: String(record.dictionaryCode ?? ''),
    dictionaryName: String(record.dictionaryName ?? ''),
    id: String(record.id ?? ''),
    // 主列表接口已经返回项值列表时，提前规范化，方便项值抽屉直接复用。
    list: Array.isArray(record.list)
      ? record.list.map((item: Record<string, any>) =>
          normalizeDictionaryItemValue(item),
        )
      : [],
    useStatus: normalizeStatus(record.useStatus),
  };
}

function normalizeDictionaryItemValue(
  record: Record<string, any>,
): SystemDictionaryApi.DictionaryItemValue {
  return {
    ...record,
    dictionaryCode: String(record.dictionaryCode ?? ''),
    id: String(record.id ?? ''),
    itemValue: String(record.itemValue ?? ''),
    itemValueName: String(record.itemValueName ?? ''),
    useStatus: normalizeStatus(record.useStatus),
  };
}

function getListRecords<T>(body: UserCenterListBody<T>) {
  if (Array.isArray(body.data)) {
    return body.data;
  }

  // 兼容后端返回 `{ data: { data: [...] } }` 的分页结构。
  if (
    body.data &&
    typeof body.data === 'object' &&
    Array.isArray(body.data.data)
  ) {
    return body.data.data;
  }

  if (
    body.data &&
    typeof body.data === 'object' &&
    Array.isArray(body.data.items)
  ) {
    return body.data.items;
  }

  if (Array.isArray(body.rows)) {
    return body.rows;
  }

  return [];
}

/**
 * 统一把后端返回的 total 转成数字，兼容字符串总数。
 */
function normalizeTotal(value: unknown) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getListTotal<T>(body: UserCenterListBody<T>, fallbackTotal: number) {
  if (body.total !== undefined && body.total !== null && body.total !== '') {
    return normalizeTotal(body.total);
  }

  if (
    body.data &&
    typeof body.data === 'object' &&
    !Array.isArray(body.data) &&
    body.data.total !== undefined &&
    body.data.total !== null &&
    body.data.total !== ''
  ) {
    return normalizeTotal(body.data.total);
  }

  return fallbackTotal;
}

/** 获取字典列表 */
export async function getDictionaryList(
  params: SystemDictionaryApi.DictionaryListQuery,
) {
  const response = await businessApi.get<
    UserCenterListBody<SystemDictionaryApi.Dictionary>
  >(
    '/qianbao/dictionary',
    {
      ...getOptionalBizParams(),
      ...params,
    },
    { responseReturn: 'body' },
  );

  const items = getListRecords(response).map((item) =>
    normalizeDictionary(item),
  );

  return {
    items,
    total: getListTotal(response, items.length),
  } satisfies SystemDictionaryApi.DictionaryListResult;
}

/** 新增字典 */
export async function createDictionary(
  data: SystemDictionaryApi.DictionaryForm,
) {
  return businessApi.post('/qianbao/dictionary', {
    ...getOptionalBizParams(),
    ...getOptionalCreator(),
    ...data,
    useStatus: String(data.useStatus),
  });
}

/** 更新字典 */
export async function updateDictionary(
  id: string,
  data: SystemDictionaryApi.DictionaryForm,
) {
  return businessApi.put(`/qianbao/dictionary/${id}`, {
    ...getOptionalBizParams(),
    ...data,
    useStatus: String(data.useStatus),
  });
}

/** 删除字典 */
export async function deleteDictionary(id: string) {
  return businessApi.delete(`/qianbao/dictionary/${id}`);
}

/** 校验字典是否重复 */
export async function checkDictionaryExists(
  params: SystemDictionaryApi.DictionaryExistsParams,
) {
  const dictionaryCode = params.dictionaryCode?.trim();
  const dictionaryName = params.dictionaryName?.trim();

  // 新增弹窗初始化时，字段可能还是空值；此时直接跳过远程校验。
  if (!dictionaryCode && !dictionaryName) {
    return true;
  }

  return businessApi.get<boolean>(
    '/qianbao/dictionary/checkDictionaryExisted',
    {
      ...getOptionalBizParams(),
      ...params,
      ...(dictionaryCode ? { dictionaryCode } : {}),
      ...(dictionaryName ? { dictionaryName } : {}),
    },
  );
}

/** 获取字典项值列表 */
export async function getDictionaryItemValueList(
  params: SystemDictionaryApi.DictionaryItemValueListQuery,
) {
  const response = await businessApi.get<
    UserCenterListBody<SystemDictionaryApi.DictionaryItemValue>
  >(
    '/qianbao/dictionary/itemValue',
    {
      pageIndex: 1,
      pageSize: 999,
      ...getOptionalBizParams(),
      ...params,
    },
    { responseReturn: 'body' },
  );

  return getListRecords(response).map((item) =>
    normalizeDictionaryItemValue(item),
  );
}

/** 新增字典项值 */
export async function createDictionaryItemValue(
  data: SystemDictionaryApi.DictionaryItemValueForm,
) {
  return businessApi.post('/qianbao/dictionary/itemValue', {
    ...getOptionalBizParams(),
    ...getOptionalCreator(),
    ...data,
    useStatus: String(data.useStatus),
  });
}

/** 更新字典项值 */
export async function updateDictionaryItemValue(
  id: string,
  data: SystemDictionaryApi.DictionaryItemValueForm,
) {
  return businessApi.put(`/qianbao/dictionary/itemValue/${id}`, {
    ...getOptionalBizParams(),
    ...data,
    useStatus: String(data.useStatus),
  });
}

/** 删除字典项值 */
export async function deleteDictionaryItemValue(id: string) {
  return businessApi.delete(`/qianbao/dictionary/itemValue/${id}`);
}

/** 校验字典项值是否重复 */
export async function checkDictionaryItemValueExists(
  params: SystemDictionaryApi.DictionaryItemValueExistsParams,
) {
  const dictionaryCode = params.dictionaryCode?.trim();
  const itemValue = params.itemValue?.trim();
  const itemValueName = params.itemValueName?.trim();

  // 字典编码或校验字段为空时，不发请求，避免后端因空参数报错。
  if (!dictionaryCode || (!itemValue && !itemValueName)) {
    return true;
  }

  return businessApi.get<boolean>(
    '/qianbao/dictionary/checkDictionaryItemValueExisted',
    {
      ...getOptionalBizParams(),
      ...params,
      dictionaryCode,
      ...(itemValue ? { itemValue } : {}),
      ...(itemValueName ? { itemValueName } : {}),
    },
  );
}
