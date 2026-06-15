<script lang="ts" setup>
import type {
  Dictionary,
  DictionaryItemValue,
  DictionaryItemValueForm,
} from '../api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

import {
  checkDictionaryItemValueExists,
  createDictionaryItemValue,
  updateDictionaryItemValue,
} from '../api';
import { useItemFormSchema } from '../config';

interface DrawerData {
  dictionary: Dictionary;
  item?: DictionaryItemValue;
}

const emit = defineEmits<{
  success: [];
}>();

const currentDictionary = ref<Dictionary>();
const currentItem = ref<DictionaryItemValue>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
  },
  schema: useItemFormSchema({
    checkItemValue: async (value) => {
      return await checkDictionaryItemValueExists({
        dictionaryCode: currentDictionary.value?.dictionaryCode ?? '',
        id: currentItem.value?.id,
        itemValue: value,
      });
    },
    checkItemValueName: async (value) => {
      return await checkDictionaryItemValueExists({
        dictionaryCode: currentDictionary.value?.dictionaryCode ?? '',
        id: currentItem.value?.id,
        itemValueName: value,
      });
    },
  }),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !currentDictionary.value?.dictionaryCode) {
      return;
    }

    const values =
      await formApi.getValues<
        Omit<DictionaryItemValueForm, 'dictionaryCode'>
      >();

    const payload: DictionaryItemValueForm = {
      ...values,
      dictionaryCode: currentDictionary.value.dictionaryCode,
    };

    drawerApi.lock();
    try {
      await (currentItem.value?.id
        ? updateDictionaryItemValue(currentItem.value.id, payload)
        : createDictionaryItemValue(payload));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }

    const data = drawerApi.getData<DrawerData>();
    currentDictionary.value = data?.dictionary;
    currentItem.value = data?.item;
    formApi.resetForm();

    if (data?.item?.id) {
      await formApi.setValues({
        itemValue: data.item.itemValue,
        itemValueName: data.item.itemValueName,
        remark: data.item.remark,
        useStatus: data.item.useStatus,
      });
      return;
    }

    await formApi.setValues({
      remark: '',
      useStatus: 1,
    });
  },
});

const title = computed(() => (currentItem.value?.id ? '编辑项值' : '新增项值'));
</script>
<template>
  <Drawer class="w-full max-w-160" :title="title">
    <Form class="mx-4" layout="vertical" />
  </Drawer>
</template>
