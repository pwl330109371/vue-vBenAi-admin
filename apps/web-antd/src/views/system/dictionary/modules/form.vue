<script lang="ts" setup>
import type { SystemDictionaryApi } from '../api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

import {
  checkDictionaryExists,
  createDictionary,
  updateDictionary,
} from '../api';
import { useFormSchema } from '../config';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemDictionaryApi.Dictionary>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
  },
  schema: useFormSchema({
    checkDictionaryCode: async (value) => {
      return await checkDictionaryExists({
        dictionaryCode: value,
        id: formData.value?.id,
      });
    },
    checkDictionaryName: async (value) => {
      return await checkDictionaryExists({
        dictionaryName: value,
        id: formData.value?.id,
      });
    },
  }),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values =
      await formApi.getValues<SystemDictionaryApi.DictionaryForm>();

    drawerApi.lock();
    try {
      await (formData.value?.id
        ? updateDictionary(formData.value.id, values)
        : createDictionary(values));
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

    const data = drawerApi.getData<SystemDictionaryApi.Dictionary>();
    formData.value = data?.id ? data : undefined;
    formApi.resetForm();

    if (data?.id) {
      await formApi.setValues({
        dictionaryCode: data.dictionaryCode,
        dictionaryName: data.dictionaryName,
        useStatus: data.useStatus,
      });
      return;
    }

    await formApi.setValues({
      useStatus: 1,
    });
  },
});

const title = computed(() =>
  formData.value?.id ? '编辑数据字典' : '新增数据字典',
);
</script>
<template>
  <Drawer class="w-full max-w-140" :title="title">
    <Form class="mx-4" layout="vertical" />
  </Drawer>
</template>
