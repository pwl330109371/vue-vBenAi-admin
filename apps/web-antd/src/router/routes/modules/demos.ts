import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: '演示',
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: 'Ant Design Vue',
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      {
        meta: {
          icon: 'mdi:file-document-outline',
          title: '操作日志 Demo',
        },
        name: 'DemoLog',
        path: '/demos/log',
        component: () => import('#/views/demos/log/index.vue'),
      },
    ],
  },
];

export default routes;
