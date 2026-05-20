import {
  defineOverridesPreferences,
  definePreferencesExtension,
} from '@vben/preferences';

interface WebAntdPreferencesExtension {
  defaultTableSize: number;
  enableFormFullscreen: boolean;
  reportTitle: string;
  tenantMode: 'multi' | 'single';
}

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    /** 生产环境使用后端驱动菜单与路由，开发期可配合 backend-mock */
    accessMode: 'backend',
    locale: 'zh-CN',
    name: import.meta.env.VITE_APP_TITLE,
  },
  widget: {
    languageToggle: false,
  },
});

export const preferencesExtension =
  definePreferencesExtension<WebAntdPreferencesExtension>({
    tabLabel: '业务偏好',
    title: 'Ant Design Vue 扩展',
    fields: [
      {
        component: 'switch',
        defaultValue: true,
        key: 'enableFormFullscreen',
        label: '表单全屏',
        tip: '弹窗表单是否支持全屏',
      },
      {
        component: 'select',
        defaultValue: 'single',
        key: 'tenantMode',
        label: '租户模式',
        options: [
          {
            label: '单租户',
            value: 'single',
          },
          {
            label: '多租户',
            value: 'multi',
          },
        ],
      },
      {
        component: 'number',
        componentProps: {
          max: 200,
          min: 10,
          step: 10,
        },
        defaultValue: 20,
        key: 'defaultTableSize',
        label: '默认表格行数',
      },
      {
        component: 'input',
        defaultValue: '',
        key: 'reportTitle',
        label: '报表标题',
        placeholder: '请输入报表标题',
      },
    ],
  });
