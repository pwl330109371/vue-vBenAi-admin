<script lang="ts" setup>
import type { Dictionary, DictionaryItemValue, UseStatus } from '../api';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';

import { formatSystemRecordStatus } from '@vben/business';
import { useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  deleteDictionaryItemValue,
  getDictionaryItemValueList,
  updateDictionaryItemValue,
} from '../api';
import { useItemColumns, useItemGridFormSchema } from '../config';
import ItemForm from './item-form.vue';

const emit = defineEmits<{
  success: [];
}>();

const currentDictionary = ref<Dictionary>();

const [ItemFormDrawer, itemFormDrawerApi] = useVbenDrawer({
  connectedComponent: ItemForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useItemGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useItemColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          const dictionary = currentDictionary.value;
          const dictionaryCode = dictionary?.dictionaryCode;
          if (!dictionaryCode) {
            return [];
          }

          // 主列表接口已经带回项值数据时，优先直接复用，避免再次请求后端导致空列表。
          const embeddedItems = Array.isArray(dictionary.list)
            ? dictionary.list
            : [];
          if (embeddedItems.length > 0) {
            const items = embeddedItems.filter((item) => {
              const itemValueKeyword = String(
                formValues.itemValue ?? '',
              ).trim();
              const itemValueNameKeyword = String(
                formValues.itemValueName ?? '',
              ).trim();
              const useStatus = formValues.useStatus;

              if (
                itemValueKeyword &&
                !String(item.itemValue ?? '').includes(itemValueKeyword)
              ) {
                return false;
              }
              if (
                itemValueNameKeyword &&
                !String(item.itemValueName ?? '').includes(itemValueNameKeyword)
              ) {
                return false;
              }
              if (
                useStatus !== undefined &&
                useStatus !== null &&
                useStatus !== '' &&
                Number(item.useStatus) !== Number(useStatus)
              ) {
                return false;
              }
              return true;
            });

            return items;
          }

          const items = await getDictionaryItemValueList({
            code: dictionaryCode,
            ...formValues,
          });

          return items;
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
  } as VxeTableGridOptions<DictionaryItemValue>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }

    currentDictionary.value = drawerApi.getData<Dictionary>();
    // 等待抽屉内部表格先完成挂载，再触发首次查询，避免首次打开时机过早报错。
    await nextTick();
    await gridApi.query();
  },
});

const title = computed(() => {
  const dictionaryName = currentDictionary.value?.dictionaryName;
  return dictionaryName ? `${dictionaryName} - 项值管理` : '项值管理';
});

function onRefresh() {
  gridApi.query();
  emit('success');
}

function onCreate() {
  if (!currentDictionary.value) {
    return;
  }

  itemFormDrawerApi
    .setData({
      dictionary: currentDictionary.value,
    })
    .open();
}

function onEdit(row: DictionaryItemValue) {
  if (!currentDictionary.value) {
    return;
  }

  itemFormDrawerApi
    .setData({
      dictionary: currentDictionary.value,
      item: row,
    })
    .open();
}

async function onStatusChange(newStatus: number, row: DictionaryItemValue) {
  try {
    await confirm(
      `你要将${row.itemValueName}的状态切换为 【${formatSystemRecordStatus(newStatus as 0 | 1)}】 吗？`,
      '切换状态',
    );
    await updateDictionaryItemValue(row.id, {
      dictionaryCode: row.dictionaryCode,
      itemValue: row.itemValue,
      itemValueName: row.itemValueName,
      remark: row.remark,
      useStatus: newStatus as UseStatus,
    });
    return true;
  } catch {
    return false;
  }
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<DictionaryItemValue>) {
  switch (code) {
    case 'edit': {
      onEdit(row);
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

function onDelete(row: DictionaryItemValue) {
  Modal.confirm({
    content: `确定删除项值 ${row.itemValueName} 吗？`,
    onOk: async () => {
      const hideLoading = message.loading({
        content: `正在删除${row.itemValueName} ...`,
        duration: 0,
        key: 'dictionary_item_delete_msg',
      });

      try {
        await deleteDictionaryItemValue(row.id);
        message.success({
          content: `${row.itemValueName} 删除成功`,
          key: 'dictionary_item_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    },
    title: '删除确认',
  });
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
</script>
<template>
  <Drawer class="w-full max-w-240" :title="title">
    <ItemFormDrawer @success="onRefresh" />
    <Grid table-title="项值列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增项值
        </Button>
      </template>
    </Grid>
  </Drawer>
</template>
