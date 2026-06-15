<script lang="ts" setup>
import type { FormInstance, Rule } from 'ant-design-vue/es/form';

import { onBeforeUnmount, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Form, Input, message } from 'ant-design-vue';

import { sendSmsCodeApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'CodeLogin' });

interface MobileLoginFormState {
  mobile: string;
  smsCode: string;
}

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const countdown = ref(0);
let countdownTimer: null | number = null;

const formState = reactive<MobileLoginFormState>({
  mobile: '',
  smsCode: '',
});

const rules: Record<string, Rule[]> = {
  mobile: [
    {
      message: $t('authentication.mobileTip'),
      required: true,
      trigger: 'blur',
    },
    {
      message: $t('authentication.mobileErrortip'),
      pattern: /^1\d{10}$/,
      trigger: 'blur',
    },
  ],
  smsCode: [
    {
      message: $t('authentication.codeTip', [6]),
      required: true,
      trigger: 'blur',
    },
  ],
};

async function handleSendCode() {
  await formRef.value?.validateFields(['mobile']);
  await sendSmsCodeApi(formState.mobile);
  message.success('验证码已发送，请注意查收');
  startCountdown();
}

async function handleSubmit() {
  await formRef.value?.validate();

  const redirect = route.query.redirect;
  const redirectPath =
    typeof redirect === 'string' ? decodeURIComponent(redirect) : '';

  await authStore.authLoginByMobile(
    {
      mobile: formState.mobile,
      smsCode: formState.smsCode,
    },
    redirectPath
      ? async () => {
          await router.push(redirectPath);
        }
      : undefined,
  );
}

function startCountdown() {
  countdown.value = 60;
  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      clearCountdown();
      return;
    }
    countdown.value -= 1;
  }, 1000);
}

function clearCountdown() {
  countdown.value = 0;
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function goToLogin() {
  router.push('/auth/login');
}

function goToQrCodeLogin() {
  router.push('/auth/qrcode-login');
}

onBeforeUnmount(() => {
  clearCountdown();
});
</script>

<template>
  <div class="auth-login-panel">
    <div class="mb-6">
      <h2 class="mb-2 text-2xl font-semibold">
        {{ $t('authentication.mobileLogin') }}
      </h2>
      <p class="text-muted-foreground">
        {{ $t('authentication.codeSubtitle') }}
      </p>
    </div>

    <Form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      @submit.prevent="handleSubmit"
    >
      <Form.Item name="mobile">
        <Input
          v-model:value="formState.mobile"
          allow-clear
          size="large"
          :placeholder="$t('authentication.mobileTip')"
          @press-enter="handleSubmit"
        />
      </Form.Item>
      <Form.Item name="smsCode">
        <div class="flex gap-3">
          <Input
            v-model:value="formState.smsCode"
            allow-clear
            size="large"
            :maxlength="6"
            :placeholder="$t('authentication.codeTip', [6])"
            @press-enter="handleSubmit"
          />
          <button
            class="captcha-trigger"
            :disabled="countdown > 0"
            type="button"
            @click="handleSendCode"
          >
            {{
              countdown > 0 ? `${countdown}s` : $t('authentication.sendCode')
            }}
          </button>
        </div>
      </Form.Item>
    </Form>

    <button
      class="submit-btn"
      :disabled="authStore.mobileLoginLoading"
      type="submit"
      @click="handleSubmit"
    >
      {{ authStore.mobileLoginLoading ? '登录中...' : '登录' }}
    </button>

    <div class="mt-4 flex gap-3">
      <button class="secondary-btn" type="button" @click="goToLogin">
        {{ $t('common.back') }}
      </button>
      <button class="secondary-btn" type="button" @click="goToQrCodeLogin">
        {{ $t('authentication.qrcodeLogin') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-login-panel {
  .captcha-trigger,
  .secondary-btn,
  .submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .submit-btn {
    width: 100%;
    height: 40px;
    color: hsl(var(--primary-foreground));
    background: hsl(var(--primary));
    border: 1px solid transparent;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .secondary-btn {
    flex: 1;
    min-width: 0;
    height: 40px;
    color: inherit;
    background: transparent;
    border: 1px solid hsl(var(--border));
  }

  .captcha-trigger {
    min-width: 120px;
    background: #fff;
    border: 1px solid hsl(var(--border));

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}
</style>
