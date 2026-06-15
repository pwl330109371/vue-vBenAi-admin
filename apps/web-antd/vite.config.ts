/**
 * Author: pengwenlei 330109371@qq.com
 * Date: 2026-05-20 09:41:42
 * LastEditors: pengwenlei 330109371@qq.com
 * LastEditTime: 2026-05-26 14:04:32
 */
import process from 'node:process';

import { defineConfig } from '@vben/vite-config';

import { loadEnv } from 'vite';

export default defineConfig(async (configEnv) => {
  const env = loadEnv(configEnv?.mode ?? 'development', process.cwd(), '');
  const userCenterProxyTarget = env.VITE_PROXY_USER_CENTER_TARGET;
  const feishuProxyTarget = env.VITE_PROXY_FEISHU_TARGET;
  const qianbaoProxyTarget = userCenterProxyTarget
    ? `${userCenterProxyTarget.replace(/\/$/, '')}/qianbao`
    : '';

  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          ...(userCenterProxyTarget
            ? {
                '/user-center/dictionary': {
                  changeOrigin: true,
                  rewrite: (path) => path.replace(/^\/user-center/, ''),
                  target: qianbaoProxyTarget,
                  ws: true,
                },
                '/qianbao': {
                  changeOrigin: true,
                  rewrite: (path) => path.replace(/^\/qianbao/, ''),
                  target: qianbaoProxyTarget,
                  ws: true,
                },
                '/user-center': {
                  changeOrigin: true,
                  rewrite: (path) => path.replace(/^\/user-center/, ''),
                  target: userCenterProxyTarget,
                  ws: true,
                },
              }
            : {}),
          ...(feishuProxyTarget
            ? {
                '/open-apis': {
                  changeOrigin: true,
                  target: feishuProxyTarget,
                  ws: true,
                },
              }
            : {}),
        },
      },
    },
  };
});
