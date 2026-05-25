import type { DemoLogApi } from './api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';

export function getLevelOptions() {
  return [
    { color: 'default', label: '信息', value: 'info' },
    { color: 'warning', label: '警告', value: 'warn' },
    { color: 'error', label: '错误', value: 'error' },
  ];
}

export function getModuleOptions() {
  return [
    { label: '系统', value: 'system' },
    { label: '认证', value: 'auth' },
    { label: '订单', value: 'order' },
    { label: '支付', value: 'payment' },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '日志标题',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: getModuleOptions(),
      },
      fieldName: 'module',
      label: '所属模块',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: getLevelOptions(),
      },
      defaultValue: 'info',
      fieldName: 'level',
      label: '日志级别',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'operator',
      label: '操作人',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'ip',
      label: 'IP 地址',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 0,
        precision: 0,
      },
      defaultValue: 0,
      fieldName: 'duration',
      label: '耗时(ms)',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '成功', value: 1 },
          { label: '失败', value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '执行状态',
    },
    {
      component: 'Textarea',
      fieldName: 'content',
      label: '日志详情',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '日志标题',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getModuleOptions(),
      },
      fieldName: 'module',
      label: '所属模块',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getLevelOptions(),
      },
      fieldName: 'level',
      label: '日志级别',
    },
    {
      component: 'Input',
      fieldName: 'operator',
      label: '操作人',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '成功', value: 1 },
          { label: '失败', value: 0 },
        ],
      },
      fieldName: 'status',
      label: '执行状态',
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '操作时间',
    },
  ];
}

export function useColumns<T = DemoLogApi.DemoLog>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns {
  return [
    {
      field: 'title',
      minWidth: 180,
      title: '日志标题',
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getModuleOptions() },
      field: 'module',
      title: '所属模块',
      width: 100,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getLevelOptions() },
      field: 'level',
      title: '日志级别',
      width: 100,
    },
    {
      field: 'operator',
      title: '操作人',
      width: 120,
    },
    {
      field: 'ip',
      title: 'IP 地址',
      width: 140,
    },
    {
      align: 'right',
      field: 'duration',
      title: '耗时(ms)',
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: '执行状态',
      width: 100,
    },
    {
      field: 'createTime',
      title: '操作时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'title',
          nameTitle: '日志',
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
