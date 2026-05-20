import type { Locale } from 'ant-design-vue/es/locale';

import type { App } from 'vue';

import { ref } from 'vue';

import { setupI18n as coreSetup } from '@vben/locales';

import antdDefaultLocale from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';

/** 仅使用中文，保留框架内置文案（@vben/locales） */
const antdLocale = ref<Locale>(antdDefaultLocale);

async function setupI18n(app: App) {
  await import('dayjs/locale/zh-cn').then((locale) => {
    dayjs.locale(locale.default ?? locale);
  });

  await coreSetup(app, {
    defaultLocale: 'zh-CN',
    loadMessages: async () => ({}),
    missingWarn: false,
  });
}

export { antdLocale, setupI18n };

/** 框架层仍可能引用，业务代码请直接写中文 */
export { $t, $te } from '@vben/locales';
