import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:user',
          title: '用户管理',
        },
        component: () => import('#/views/system/user/index.vue'),
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: '角色管理',
        },
        component: () => import('#/views/system/role/index.vue'),
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: '菜单管理',
        },
        component: () => import('#/views/system/menu/index.vue'),
      },
      {
        path: '/system/dept',
        name: 'SystemDept',
        meta: {
          icon: 'charm:organisation',
          title: '部门管理',
        },
        component: () => import('#/views/system/dept/index.vue'),
      },
      {
        path: '/system/dictionary',
        name: 'SystemDictionary',
        meta: {
          icon: 'mdi:book-open-page-variant',
          title: '数据字典',
        },
        component: () => import('#/views/system/dictionary/index.vue'),
      },
    ],
  },
];

export default routes;
