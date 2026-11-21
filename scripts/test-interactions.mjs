import { chromium } from 'playwright-core';

const BASE = 'http://localhost:4173';
const results = [];
const ok = (name, cond, extra = '') =>
  results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

// 1. 首页导航
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
ok('首页标题', (await page.title()).includes('档案馆'), await page.title());

await page.getByRole('link', { name: 'Works', exact: true }).first().click();
await page.waitForURL('**/works');
ok('导航到 WORKS', page.url().endsWith('/works'));

// 2. 画廊 / 目录切换
await page.getByRole('button', { name: 'Index' }).click();
await page.waitForTimeout(200);
ok('切换到目录模式', page.url().includes('mode=index'));
ok('目录行存在', (await page.locator('.idx__row').count()) === 8, `${await page.locator('.idx__row').count()} 行`);

await page.getByRole('button', { name: 'Gallery' }).click();
await page.waitForTimeout(200);
ok('切回画廊模式', (await page.locator('.gcard').count()) === 8);

// 3. 分类筛选
await page.getByRole('button', { name: /^数字产品/ }).click();
await page.waitForTimeout(250);
ok('分类筛选生效', (await page.locator('.gcard').count()) === 2, `${await page.locator('.gcard').count()} 张`);
ok('分类写入 URL', page.url().includes('category=digital-products'));

// 4. 搜索
await page.getByRole('button', { name: /^全部/ }).first().click();
await page.waitForTimeout(200);
await page.fill('#archive-search', '知识');
await page.waitForTimeout(300);
ok('搜索生效', (await page.locator('.gcard').count()) === 1, `${await page.locator('.gcard').count()} 张`);

await page.fill('#archive-search', 'zzzz');
await page.waitForTimeout(300);
ok('空状态出现', (await page.locator('.empty').count()) === 1);
await page.getByRole('button', { name: /清除全部筛选/ }).click();
await page.waitForTimeout(300);
ok('清除筛选恢复', (await page.locator('.gcard').count()) === 8);

// 5. 排序
await page.selectOption('#archive-sort', 'old');
await page.waitForTimeout(250);
const firstTitle = await page.locator('.gcard__title').first().innerText();
ok('按最早排序', firstTitle.includes('铅字'), firstTitle.split('\n')[0]);

// 6. 进入详情页
await page.goto(BASE + '/works/still-reading', { waitUntil: 'networkidle' });
ok('详情页标题', (await page.locator('h1').first().innerText()).includes('静读'));
ok('目录锚点数量', (await page.locator('.proj-toc a').count()) === 6);

// 7. 图片放大
await page.locator('.pgal__btn').first().click();
await page.waitForTimeout(400);
ok('灯箱打开', (await page.locator('.lb').count()) === 1);
const counter1 = await page.locator('.lb__count').innerText();
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
const counter2 = await page.locator('.lb__count').innerText();
ok('灯箱可切换', counter1 !== counter2, `${counter1} → ${counter2}`);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok('Esc 关闭灯箱', (await page.locator('.lb').count()) === 0);

// 8. 上下页
await page.getByRole('link', { name: /下一件/ }).click();
await page.waitForURL('**/works/echo');
ok('下一件导航', page.url().includes('/works/echo'));

// 9. About / Contact
await page.goto(BASE + '/about', { waitUntil: 'networkidle' });
ok('About 渲染', (await page.locator('.principle').count()) === 4);
await page.goto(BASE + '/contact', { waitUntil: 'networkidle' });
ok('Contact 渲染', (await page.locator('.contact-row').count()) >= 4);

// 10. 移动端菜单
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await m.goto(BASE + '/', { waitUntil: 'networkidle' });
await m.getByRole('button', { name: /Index/ }).click();
await m.waitForTimeout(500);
ok('移动菜单打开', await m.locator('.menu').isVisible());
ok('菜单项数量', (await m.locator('.menu__link').count()) === 5);
await m.keyboard.press('Escape');
await m.waitForTimeout(300);
ok('Esc 关闭菜单', (await m.locator('.menu').count()) === 0);

// 11. 横向溢出检查
const overflow = async (p, name) => {
  const res = await p.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  ok(`${name} 无横向溢出`, res.scroll <= res.client + 1, `${res.scroll} / ${res.client}`);
};
await overflow(page, '1440');
await overflow(m, '390');

for (const path of ['/works', '/works/still-reading', '/about', '/contact']) {
  await m.goto(BASE + path, { waitUntil: 'networkidle' });
  await overflow(m, `390 ${path}`);
}

// 12. 键盘可达性：Tab 到第一个链接
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
ok('Tab 聚焦跳过链接', focused?.includes('跳到主要内容'), focused ?? '');

// 13. 减少动效下内容可见
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await rm.goto(BASE + '/works', { waitUntil: 'networkidle' });
const hidden = await rm.evaluate(() =>
  Array.from(document.querySelectorAll('[data-reveal]')).filter(
    (el) => getComputedStyle(el).opacity === '0',
  ).length,
);
ok('减少动效时无隐藏内容', hidden === 0, `${hidden} 个隐藏`);

ok('无运行时错误', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();
console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed}/${results.length} 通过`);
process.exit(failed ? 1 : 0);
