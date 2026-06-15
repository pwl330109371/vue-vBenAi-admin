<script lang="ts" setup>
import type { FormInstance, Rule } from 'ant-design-vue/es/form';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAppConfig } from '@vben/hooks';
import { $t } from '@vben/locales';

import { Checkbox, Form, Input } from 'ant-design-vue';
import CryptoJS from 'crypto-js';

import { getCaptchaApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

interface LoginFormState {
  code: string;
  password: string;
  rememberMe: boolean;
  username: string;
  uuid: string;
}

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const {
  userCenter: { loginAesKey },
} = useAppConfig(import.meta.env, import.meta.env.PROD);

const formRef = ref<FormInstance>();
const captchaImage = ref('');

const REMEMBER_PASSWORD_KEY = `USER_CENTER_LOGIN_PASSWORD_${location.hostname}`;
const REMEMBER_USERNAME_KEY = `USER_CENTER_LOGIN_USERNAME_${location.hostname}`;

const formState = reactive<LoginFormState>({
  code: '',
  password: '',
  rememberMe: false,
  username: '',
  uuid: '',
});

const rules: Record<string, Rule[]> = {
  code: [{ message: '请输入图形验证码', required: true, trigger: 'blur' }],
  password: [
    {
      message: $t('authentication.passwordTip'),
      required: true,
      trigger: 'blur',
    },
  ],
  username: [
    {
      message: $t('authentication.usernameTip'),
      required: true,
      trigger: 'blur',
    },
  ],
};

const showMoreLoginMethods = computed(() => route.path.startsWith('/auth/'));
const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? decodeURIComponent(redirect) : '';
});

async function fetchCaptcha() {
  const { img, uuid } = await getCaptchaApi();
  captchaImage.value = `data:image/gif;base64,${img}`;
  formState.code = '';
  formState.uuid = uuid;
}

async function handleSubmit() {
  await formRef.value?.validate();

  const encryptedPassword = encryptCredential(formState.password);
  const encryptedUsername = encryptCredential(formState.username);

  if (formState.rememberMe) {
    localStorage.setItem(
      REMEMBER_USERNAME_KEY,
      encryptCredential(formState.username),
    );
    localStorage.setItem(REMEMBER_PASSWORD_KEY, encryptedPassword);
  } else {
    localStorage.removeItem(REMEMBER_USERNAME_KEY);
    localStorage.removeItem(REMEMBER_PASSWORD_KEY);
  }

  try {
    await authStore.authLogin(
      {
        code: formState.code,
        password: encryptedPassword,
        username: encryptedUsername,
        uuid: formState.uuid,
      },
      redirectPath.value
        ? async () => {
            await router.push(redirectPath.value);
          }
        : undefined,
    );
  } catch (error) {
    await fetchCaptcha();
    throw error;
  }
}

function encryptCredential(value: string) {
  return CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(value),
    CryptoJS.enc.Utf8.parse(loginAesKey),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString();
}

function goToCodeLogin() {
  router.push('/auth/code-login');
}

function goToQrcodeLogin() {
  router.push('/auth/qrcode-login');
}

function restoreRememberedAccount() {
  const localUsername = localStorage.getItem(REMEMBER_USERNAME_KEY);
  const localPassword = localStorage.getItem(REMEMBER_PASSWORD_KEY);
  if (!localUsername || !localPassword) {
    return;
  }

  try {
    formState.username = decryptCredential(localUsername);
    formState.password = decryptCredential(localPassword);
    formState.rememberMe = true;
  } catch {
    localStorage.removeItem(REMEMBER_USERNAME_KEY);
    localStorage.removeItem(REMEMBER_PASSWORD_KEY);
  }
}

function decryptCredential(value: string) {
  return CryptoJS.AES.decrypt(value, CryptoJS.enc.Utf8.parse(loginAesKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
    .toString(CryptoJS.enc.Utf8)
    .toString();
}

onMounted(async () => {
  restoreRememberedAccount();
  await fetchCaptcha();
});
</script>

<template>
  <div class="auth-login-panel">
    <div class="mb-6">
      <h2 class="mb-2 text-2xl font-semibold">
        {{ $t('authentication.welcomeBack') }}
      </h2>
      <p class="text-muted-foreground">
        {{ $t('authentication.loginSubtitle') }}
      </p>
    </div>

    <Form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      @submit.prevent="handleSubmit"
    >
      <Form.Item name="username">
        <Input
          v-model:value="formState.username"
          allow-clear
          size="large"
          :placeholder="$t('authentication.usernameTip')"
          @press-enter="handleSubmit"
        />
      </Form.Item>
      <Form.Item name="password">
        <Input.Password
          v-model:value="formState.password"
          allow-clear
          size="large"
          :placeholder="$t('authentication.passwordTip')"
          @press-enter="handleSubmit"
        />
      </Form.Item>
      <Form.Item name="code">
        <div class="flex gap-3">
          <Input
            v-model:value="formState.code"
            allow-clear
            size="large"
            placeholder="请输入图形验证码"
            @press-enter="handleSubmit"
          />
          <button class="captcha-trigger" type="button" @click="fetchCaptcha">
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="captcha"
              class="captcha-image"
            />
            <span v-else>获取验证码</span>
          </button>
        </div>
      </Form.Item>
    </Form>

    <div class="mb-6 flex items-center justify-between">
      <Checkbox v-model:checked="formState.rememberMe">
        {{ $t('authentication.rememberMe') }}
      </Checkbox>
      <span class="login-link" @click="fetchCaptcha">刷新验证码</span>
    </div>

    <button
      class="submit-btn"
      :disabled="authStore.loginLoading"
      type="submit"
      @click="handleSubmit"
    >
      {{ authStore.loginLoading ? '登录中...' : '登录' }}
    </button>

    <div v-if="showMoreLoginMethods" class="mt-4 flex gap-3">
      <button class="secondary-btn" type="button" @click="goToCodeLogin">
        {{ $t('authentication.mobileLogin') }}
      </button>
      <button class="secondary-btn" type="button" @click="goToQrcodeLogin">
        {{ $t('authentication.qrcodeLogin') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-login-panel {
  .login-link {
    font-size: 14px;
    color: var(--ant-color-link);
    cursor: pointer;
  }

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
    padding: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid hsl(var(--border));
  }

  .captcha-image {
    display: block;
    width: 118px;
    height: 38px;
  }
}
</style>
