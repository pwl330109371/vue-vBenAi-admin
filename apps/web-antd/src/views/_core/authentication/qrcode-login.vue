<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAppConfig } from '@vben/hooks';
import { $t } from '@vben/locales';

import { Alert } from 'ant-design-vue';

defineOptions({ name: 'QrCodeLogin' });

const router = useRouter();
const {
  auth: { feishu },
} = useAppConfig(import.meta.env, import.meta.env.PROD);

const state = `vben-${Date.now()}`;
const authorizeUrl = computed(() => {
  if (!feishu?.appId || !feishu.redirectURL) {
    return '';
  }

  const params = new URLSearchParams();
  params.set('client_id', feishu.appId);
  params.set('redirect_uri', feishu.redirectURL);
  params.set('response_type', 'code');
  params.set('state', state);

  return `https://passport.feishu.cn/suite/passport/oauth/authorize?${params.toString()}`;
});

function goToLogin() {
  router.push('/auth/login');
}

function goToCodeLogin() {
  router.push('/auth/code-login');
}

function openFeishuLogin() {
  if (!authorizeUrl.value) {
    return;
  }
  window.location.href = authorizeUrl.value;
}
</script>

<template>
  <div class="auth-qrcode-panel">
    <div class="mb-6">
      <h2 class="mb-2 text-2xl font-semibold">
        {{ $t('authentication.qrcodeLogin') }}
      </h2>
      <p class="text-muted-foreground">
        {{ $t('authentication.qrcodeSubtitle') }}
      </p>
    </div>

    <Alert
      v-if="!authorizeUrl"
      message="未配置飞书登录参数"
      type="warning"
      show-icon
    />
    <template v-else>
      <div class="qr-box">
        <div class="text-center">
          <p class="mb-4 text-sm text-muted-foreground">
            飞书当前通过授权页完成扫码登录，点击下方按钮后使用飞书扫码确认。
          </p>
          <button class="submit-btn" type="button" @click="openFeishuLogin">
            打开飞书扫码登录
          </button>
        </div>
      </div>
      <p class="mt-4 text-sm text-muted-foreground">
        扫码确认后会自动跳转并完成登录
      </p>
    </template>

    <div class="mt-4 flex gap-3">
      <button class="secondary-btn" type="button" @click="goToLogin">
        {{ $t('common.back') }}
      </button>
      <button class="secondary-btn" type="button" @click="goToCodeLogin">
        {{ $t('authentication.mobileLogin') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-qrcode-panel {
  .qr-box {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    padding: 16px;
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
  }

  .secondary-btn {
    display: inline-flex;
    flex: 1;
    justify-content: center;
    min-width: 0;
    height: 40px;
    font-size: 14px;
    line-height: 40px;
    color: inherit;
    cursor: pointer;
    background: transparent;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .submit-btn {
    display: inline-flex;
    justify-content: center;
    width: 100%;
    height: 40px;
    font-size: 14px;
    color: hsl(var(--primary-foreground));
    cursor: pointer;
    background: hsl(var(--primary));
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
}
</style>
