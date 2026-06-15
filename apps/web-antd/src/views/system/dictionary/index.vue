<script lang="ts" setup>
import type { Dictionary } from './api';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteDictionary, getDictionaryList } from './api';
import { useColumns, useGridFormSchema } from './config';
import Form from './modules/form.vue';
import ItemValues from './modules/item-values.vue';

// Dictionary create/edit drawer.
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// Nested drawer for managing dictionary item values.
const [ItemValuesDrawer, itemValuesDrawerApi] = useVbenDrawer({
  connectedComponent: ItemValues,
  destroyOnClose: true,
});

// Main list grid: search form + paginated remote data + column sort.
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDictionaryList({
            dictionaryCode: formValues.dictionaryCode,
            dictionaryName: formValues.dictionaryName,
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    sortConfig: {
      defaultSort: { field: 'createTime', order: 'desc' },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<Dictionary>,
});

/** Route row operation buttons to the matching handler. */
function onActionClick({ code, row }: OnActionClickParams<Dictionary>) {
  switch (code) {
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'items': {
      onManageItems(row);
      break;
    }
    case 'remove': {
      onDelete(row);
      break;
    }
    default: {
      break;
    }
  }
}

/** Reload the current page after create/update/delete. */
function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData(undefined).open();
}

function onEdit(row: Dictionary) {
  formDrawerApi.setData(row).open();
}

function onManageItems(row: Dictionary) {
  itemValuesDrawerApi.setData(row).open();
}

function onDelete(row: Dictionary) {
  Modal.confirm({
    content: `确定删除字典 ${row.dictionaryName} 吗？`,
    onOk: async () => {
      const hideLoading = message.loading({
        content: `正在删除${row.dictionaryName} ...`,
        duration: 0,
        key: 'dictionary_delete_msg',
      });

      try {
        await deleteDictionary(row.id);
        message.success({
          content: `${row.dictionaryName} 删除成功`,
          key: 'dictionary_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    },
    title: '删除确认',
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <ItemValuesDrawer />
    <Grid table-title="数据字典列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增字典
        </Button>
      </template>
    </Grid>
  </Page>
</template>
