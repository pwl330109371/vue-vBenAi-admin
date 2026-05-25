import { faker } from '@faker-js/faker';
import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const modules = ['system', 'auth', 'order', 'payment'] as const;
const levels = ['info', 'warn', 'error'] as const;

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem: Record<string, any> = {
      id: faker.string.uuid(),
      title: faker.helpers.arrayElement([
        '用户登录',
        '修改角色权限',
        '导出订单报表',
        '支付回调处理',
        '删除菜单节点',
      ]),
      module: faker.helpers.arrayElement(modules),
      level: faker.helpers.arrayElement(levels),
      operator: faker.person.fullName(),
      ip: faker.internet.ipv4(),
      duration: faker.number.int({ max: 5000, min: 10 }),
      status: faker.helpers.arrayElement([0, 1]),
      content: faker.lorem.paragraph(),
      createTime: formatterCN.format(
        faker.date.between({ from: '2024-01-01', to: '2026-01-01' }),
      ),
    };

    dataList.push(dataItem);
  }

  return dataList;
}

const mockData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    page = 1,
    pageSize = 20,
    title,
    module,
    level,
    operator,
    startTime,
    endTime,
    status,
  } = getQuery(event);
  let listData = structuredClone(mockData);

  if (title) {
    listData = listData.filter((item) =>
      item.title.toLowerCase().includes(String(title).toLowerCase()),
    );
  }
  if (module) {
    listData = listData.filter((item) => item.module === module);
  }
  if (level) {
    listData = listData.filter((item) => item.level === level);
  }
  if (operator) {
    listData = listData.filter((item) =>
      item.operator.toLowerCase().includes(String(operator).toLowerCase()),
    );
  }
  if (startTime) {
    listData = listData.filter((item) => item.createTime >= startTime);
  }
  if (endTime) {
    listData = listData.filter((item) => item.createTime <= endTime);
  }
  if (['0', '1'].includes(status as string)) {
    listData = listData.filter((item) => item.status === Number(status));
  }

  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
