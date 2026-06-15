<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Result, Spin } from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'FeishuRedirect' });

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const errorMessage = ref('');
const loading = ref(true);

onMounted(async () => {
  const code = route.query.code;
  if (typeof code !== 'string' || !code) {
    errorMessage.value = '飞书登录回调缺少 code 参数';
    loading.value = false;
    return;
  }

  try {
    await authStore.authLoginByFeishuCode(code);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '飞书登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
});

function goToLogin() {
  router.push('/auth/login');
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <Spin v-if="loading" size="large" tip="飞书登录中..." />
    <Result
      v-else-if="errorMessage"
      status="error"
      title="飞书登录失败"
      :sub-title="errorMessage"
    >
      <template #extra>
        <button class="result-btn" type="button" @click="goToLogin">
          返回登录页
        </button>
      </template>
    </Result>
  </div>
</template>

<style lang="scss" scoped>
.result-btn {
  display: inline-flex;
  justify-content: center;
  width: 120px;
  height: 40px;
  font-size: 14px;
  color: hsl(var(--primary-foreground));
  cursor: pointer;
  background: hsl(var(--primary));
  border: 1px solid transparent;
  border-radius: 8px;
}
</style>
