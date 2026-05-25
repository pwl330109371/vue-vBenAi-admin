<script lang="ts" setup>
import type { DemoLogApi } from './api';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { formatSystemRecordStatus } from '@vben/business';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteLog, getLogList, updateLog } from './api';
import { useColumns, useGridFormSchema } from './config';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getLogList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<DemoLogApi.DemoLog>,
});

function onActionClick(e: OnActionClickParams<DemoLogApi.DemoLog>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

async function onStatusChange(newStatus: number, row: DemoLogApi.DemoLog) {
  try {
    await confirm(
      `你要将「${row.title}」的执行状态切换为 【${formatSystemRecordStatus(newStatus as 0 | 1)}】 吗？`,
      '切换状态',
    );
    await updateLog(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: DemoLogApi.DemoLog) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: DemoLogApi.DemoLog) {
  const hideLoading = message.loading({
    content: `正在删除${row.title} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteLog(row.id)
    .then(() => {
      message.success({
        content: `${row.title} 删除成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid table-title="操作日志列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增日志
        </Button>
      </template>
    </Grid>
  </Page>
</template>
