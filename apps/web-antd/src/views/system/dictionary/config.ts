import type { Dictionary, DictionaryItemValue } from './api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';

const statusOptions = [
  { label: '已启用', value: 1 },
  { label: '已禁用', value: 0 },
] as const;

export function useFormSchema(options: {
  checkDictionaryCode: (value: string) => Promise<boolean>;
  checkDictionaryName: (value: string) => Promise<boolean>;
}): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictionaryCode',
      label: '字典编码',
      rules: z
        .string()
        .trim()
        .min(1, '请输入字典编码')
        .max(50, '字典编码最多 50 个字符')
        .regex(/^[\w-]+$/, '字典编码仅支持字母、数字、下划线和中划线')
        .refine(
          async (value: string) => {
            // 空值场景交给必填规则处理，这里不再触发远程重复校验。
            if (!value?.trim()) {
              return true;
            }
            return await options.checkDictionaryCode(value);
          },
          (value) => ({
            message: `字典编码 \`${value}\` 已存在`,
          }),
        ),
    },
    {
      component: 'Input',
      fieldName: 'dictionaryName',
      label: '字典名称',
      rules: z
        .string()
        .trim()
        .min(1, '请输入字典名称')
        .max(50, '字典名称最多 50 个字符')
        .refine(
          async (value: string) => {
            // 空值场景交给必填规则处理，这里不再触发远程重复校验。
            if (!value?.trim()) {
              return true;
            }
            return await options.checkDictionaryName(value);
          },
          (value) => ({
            message: `字典名称 \`${value}\` 已存在`,
          }),
        ),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: statusOptions,
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'useStatus',
      label: '状态',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictionaryCode',
      label: '字典编码',
    },
    {
      component: 'Input',
      fieldName: 'dictionaryName',
      label: '字典名称',
    },
  ];
}

export function useColumns<T = Dictionary>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridColumns {
  return [
    {
      field: 'dictionaryName',
      minWidth: 180,
      title: '字典名称',
    },
    {
      field: 'dictionaryCode',
      minWidth: 160,
      title: '字典编码',
    },
    {
      cellRender: {
        name: 'CellTag',
      },
      field: 'useStatus',
      title: '状态',
      width: 120,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        props: {
          size: 'small',
        },
        name: 'CellOperation',
        options: [
          { code: 'items', text: '项值' },
          'edit',
          { code: 'remove', danger: true, text: '删除' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 200,
    },
  ];
}

export function useItemGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'itemValue',
      label: '项值标识',
    },
    {
      component: 'Input',
      fieldName: 'itemValueName',
      label: '项值名称',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: statusOptions,
      },
      fieldName: 'useStatus',
      label: '状态',
    },
  ];
}

export function useItemFormSchema(options: {
  checkItemValue: (value: string) => Promise<boolean>;
  checkItemValueName: (value: string) => Promise<boolean>;
}): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'itemValue',
      label: '项值标识',
      rules: z
        .string()
        .trim()
        .min(1, '请输入项值标识')
        .max(50, '项值标识最多 50 个字符')
        .regex(/^[\w-]+$/, '项值标识仅支持字母、数字、下划线和中划线')
        .refine(
          async (value: string) => {
            // 空值场景交给必填规则处理，这里不再触发远程重复校验。
            if (!value?.trim()) {
              return true;
            }
            return await options.checkItemValue(value);
          },
          (value) => ({
            message: `项值标识 \`${value}\` 已存在`,
          }),
        ),
    },
    {
      component: 'Input',
      fieldName: 'itemValueName',
      label: '项值名称',
      rules: z
        .string()
        .trim()
        .min(1, '请输入项值名称')
        .max(50, '项值名称最多 50 个字符')
        .refine(
          async (value: string) => {
            // 空值场景交给必填规则处理，这里不再触发远程重复校验。
            if (!value?.trim()) {
              return true;
            }
            return await options.checkItemValueName(value);
          },
          (value) => ({
            message: `项值名称 \`${value}\` 已存在`,
          }),
        ),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        rows: 4,
        showCount: true,
      },
      fieldName: 'remark',
      label: '备注',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: statusOptions,
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'useStatus',
      label: '状态',
    },
  ];
}

export function useItemColumns<T = DictionaryItemValue>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange: (newStatus: number, row: T) => Promise<boolean | undefined>,
): VxeTableGridColumns {
  return [
    {
      field: 'dictionaryCode',
      minWidth: 140,
      title: '字典编码',
    },
    {
      field: 'itemValue',
      minWidth: 140,
      title: '项值标识',
    },
    {
      field: 'itemValueName',
      minWidth: 160,
      title: '项值名称',
    },
    {
      field: 'remark',
      minWidth: 180,
      title: '备注',
    },
    {
      cellRender: {
        attrs: {
          beforeChange: onStatusChange,
        },
        name: 'CellSwitch',
      },
      field: 'useStatus',
      title: '状态',
      width: 120,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        props: {
          size: 'small',
        },
        name: 'CellOperation',
        options: ['edit', { code: 'remove', danger: true, text: '删除' }],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 140,
    },
  ];
}
