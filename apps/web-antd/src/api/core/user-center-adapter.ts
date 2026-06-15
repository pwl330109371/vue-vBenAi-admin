import type { RouteRecordStringComponent, UserInfo } from '@vben/types';

export interface UserCenterRawLoginResult {
  access_token?: string;
  accessToken?: string;
  token?: string;
}

export interface UserCenterRawUserInfo {
  avatar?: string;
  desc?: string;
  homePath?: string;
  id?: number | string;
  nickName?: string;
  realName?: string;
  roleMenuPerms?: string[];
  roles?: string[];
  token?: string;
  userId?: number | string;
  userName?: string;
  user_id?: number | string;
  username?: string;
  [key: string]: any;
}

export interface UserCenterRawMenuRoute {
  children?: UserCenterRawMenuRoute[];
  component?: string;
  hidden?: boolean;
  meta?: Record<string, any>;
  name?: string;
  path?: string;
  redirect?: string;
  [key: string]: any;
}

export interface NormalizedUserInfo extends UserInfo {
  accessCodes: string[];
  rawUserInfo: UserCenterRawUserInfo;
}

export function normalizeAccessToken(payload: UserCenterRawLoginResult) {
  return payload.accessToken || payload.access_token || payload.token || '';
}

export function normalizeUserInfo(
  rawUserInfo: UserCenterRawUserInfo,
): NormalizedUserInfo {
  const username = rawUserInfo.userName || rawUserInfo.username || '';
  const realName = rawUserInfo.nickName || rawUserInfo.realName || username;
  const accessCodes = Array.isArray(rawUserInfo.roleMenuPerms)
    ? rawUserInfo.roleMenuPerms
    : [];

  return {
    ...rawUserInfo,
    accessCodes,
    avatar: rawUserInfo.avatar || '',
    desc: rawUserInfo.desc || realName,
    homePath: rawUserInfo.homePath || '',
    rawUserInfo,
    realName,
    roles: Array.isArray(rawUserInfo.roles) ? rawUserInfo.roles : [],
    token: rawUserInfo.token || '',
    userId: String(
      rawUserInfo.userId || rawUserInfo.user_id || rawUserInfo.id || '',
    ),
    username,
  };
}

export function normalizeMenuRoutes(
  routes: UserCenterRawMenuRoute[] = [],
): RouteRecordStringComponent[] {
  return routes.map((route) => {
    const path = normalizeRoutePath(route.path);
    const component = normalizeComponent(route.component);
    const meta = {
      ...route.meta,
      hideInMenu: route.hidden || route.meta?.hideInMenu,
      title: route.meta?.title || route.name || path,
    };

    return {
      ...route,
      children: normalizeMenuRoutes(route.children || []),
      component,
      meta,
      name: normalizeRouteName(route.name, path),
      path,
      redirect: normalizeRedirect(route.redirect),
    } as RouteRecordStringComponent;
  });
}

export function resolveHomePathFromMenus(
  routes: RouteRecordStringComponent[],
): string {
  for (const route of routes) {
    if (route.meta?.hideInMenu) {
      continue;
    }

    if (route.children?.length) {
      const childHomePath: string = resolveHomePathFromMenus(route.children);
      if (childHomePath) {
        return childHomePath;
      }
    }

    if (route.path && route.path !== '/') {
      return route.path;
    }
  }

  return '';
}

function buildRouteName(path: string) {
  return path
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment.replaceAll(/[-_](\w)/g, (_, word: string) => word.toUpperCase()),
    )
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

/** Ruoyi / Element-Admin layout component aliases */
const LAYOUT_COMPONENT_MAP: Record<string, string> = {
  BasicLayout: 'BasicLayout',
  IFrameView: 'IFrameView',
  Layout: 'BasicLayout',
};

function normalizeComponent(component?: string) {
  if (!component) {
    return '';
  }

  const bare = component
    .replace(/^(\.\/|\.\.\/)+/, '')
    .replace(/^views\//, '')
    .replace(/\.vue$/, '');

  if (LAYOUT_COMPONENT_MAP[bare]) {
    return LAYOUT_COMPONENT_MAP[bare];
  }

  const normalizedComponent = bare.startsWith('/') ? bare : `/${bare}`;

  return normalizedComponent;
}

function normalizeRedirect(redirect?: string) {
  if (!redirect || redirect === 'noRedirect' || redirect === '/noRedirect') {
    return undefined;
  }

  return normalizeRoutePath(redirect);
}

function normalizeRouteName(name?: string, path?: string) {
  const candidate = name?.trim();
  if (!candidate || candidate.includes('/') || candidate.includes('.')) {
    return buildRouteName(path || candidate || '');
  }
  return candidate;
}

function normalizeRoutePath(path?: string) {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}
