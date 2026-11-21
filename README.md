# 个人数字档案馆 · Personal Digital Archive

一个以「数字年鉴」为概念的长期个人作品档案站。瑞士编辑设计 × 纸本文艺 × 档案馆秩序。

React + TypeScript + Vite，无后端，作品数据集中在 `src/data/` 内，新增作品不需要改动任何页面代码。

**线上地址**：https://x13502239474-oss.github.io/archive/

推送到 `main` 分支后由 GitHub Actions 自动构建并发布到 GitHub Pages。

---

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 生产构建，输出 dist/
npm run preview  # 预览构建结果 http://localhost:4173
npm test         # 交互自测（导航 / 筛选 / 搜索 / 灯箱 / 移动菜单 / 溢出）
```

---

## 目录结构

```
src/
├─ data/
│  ├─ site.ts        站点身份：姓名、简介、联系方式、关于页正文
│  ├─ categories.ts  作品分类（可自由增加）
│  └─ projects.ts    ★ 作品档案，所有内容都在这里
├─ types.ts          数据结构定义
├─ pages/            Home / Works / ProjectDetail / About / Contact
├─ components/       Nav、Footer、Plate（图版）、Lightbox、Arrow
├─ hooks/useSite.ts  滚动显现、路由滚动复位、页面标题
└─ styles/           设计令牌与各页面样式
```

---

## 添加一件作品

打开 `src/data/projects.ts`，在数组末尾追加一个对象即可。**不需要修改任何组件。**

```ts
{
  id: 'my-new-work',          // URL 标识，小写连字符，必须唯一
  code: 'DP·2026·09',         // 档案编号：分类缩写·年份·序号
  title: '作品名',
  titleEn: 'MY NEW WORK',     // 可留空
  category: 'digital-products',
  year: 2026,
  month: 3,                   // 可选，用于精确排序
  order: 90,                  // 越大越靠前（默认排序依据）
  featured: true,             // 是否进入首页精选
  summary: '一句话简介，出现在列表里。',
  description: '两三句的项目简介，出现在详情页标题下。',
  cover: { ... },             // 封面
  gallery: [ ... ],           // 详情页图版
  tags: ['工具', '排版'],
  projectUrl: 'https://...',  // 留空则显示“暂未公开”
  background: '创作背景与目的……',
  designConcept: '核心设计理念……',
  features: [{ title: '功能标题', body: '说明' }],
  process:  [{ title: '阶段标题', body: '说明' }],
  technology: ['React', 'TypeScript'],
  content: '可选的补记段落。',
}
```

### 字段说明

| 字段 | 说明 |
| --- | --- |
| `id` | 详情页地址 `/works/<id>`，改了就换了链接 |
| `code` | 档案编号，显示在卡片与详情页；建议 `分类缩写·年份·序号` |
| `category` | 必须是 `categories.ts` 里已有的 `id` |
| `order` | 手动排序权重，数字越大越靠前 |
| `featured` | 首页「精选作品」最多展示 4 件，按 order 取前 4 |
| `cover` / `gallery` | 见下方「图片」 |
| `projectUrl` | 有值时详情页出现「在线访问」按钮 |

---

## 图片

每张图片有两种来源，**填了 `src` 就用真实图片，没填就用图版**：

```ts
// 1) 真实截图：把文件放进 public/images/<作品id>/，src 写绝对路径
{ id: 'sr-1', src: '/images/still-reading/01.jpg', alt: '书架视图',
  caption: '图注文字', ratio: 'landscape' }

// 2) 生成的图版：没有真实图片时的占位
{ id: 'sr-1', alt: '书架视图', caption: '图注文字', ratio: 'landscape',
  plate: { motif: 'stack', tone: 'paper', density: 7 } }
```

- `ratio`：`portrait` 4:5 / `landscape` 3:2 / `square` 1:1 / `wide` 16:9 / `tall` 2:3
- `motif`：`stack` `lines` `grid` `arcs` `letter` `bars` `orbit`
- `tone`：`paper` `ink` `brick` `navy` `olive`
- `density`：母题的疏密（可选）

图版不是「假截图」，而是用排版语言为每件作品绘制的封面系统。真实截图到位后逐一替换 `src` 即可，布局不用动。

---

## 添加分类

在 `src/data/categories.ts` 追加一项，筛选区、首页目录、关于页会自动出现：

```ts
{ index: '05', id: 'writings', name: '文字', nameEn: 'Writings',
  description: '长文、随笔与翻译。' }
```

`index` 只是显示用的两位数编号。作品数量由 `projects.ts` 自动统计。

---

## 修改个人信息

`src/data/site.ts`：

- `name` / `nameEn` / `archiveTitle`：姓名与档案卷名
- `headline`：首屏大标题，数组每项一行
- `lede`：首屏简介
- `email` / `links`：联系方式。**留空（`''`）的渠道会显示为「待补充」，不会编造。**
- `about`：关于页的简介、段落、兴趣、理念、工具、正在探索

---

## 部署

已配置 GitHub Actions（`.github/workflows/deploy.yml`）：推送到 `main` 即自动构建并发布到 GitHub Pages，构建时注入 `VITE_BASE=/archive/`，路由 basename 自动跟随。

本地手动部署到其他静态托管：`npm run build` 后上传 `dist/`，并配置 SPA 回退：

- Netlify / Cloudflare Pages：`public/_redirects` 已包含 `/* /index.html 200`
- Vercel：`vercel.json` 已包含 rewrite 规则
- Nginx：`try_files $uri $uri/ /index.html;`

---

## 设计约定

- **色板**：`#f4f0e6` 纸 / `#17160f` 墨 / `#9b3c2c` 砖红 / `#20364c` 深蓝 / `#4c5340` 暗橄榄
- **字体**：Newsreader（标题与长文）+ Archivo（标签、导航、数据）
- **网格**：12 栏，左右外边距 20 / 40 / 56 / 72px 随断点递增
- **圆角**：全站 0；不使用阴影、渐变、玻璃拟态
- **分隔**：只使用 1px 细线，颜色 `rgba(23,22,15,.16)`

样式令牌集中在 `src/styles/tokens.css`，改这里即可整体换色换字。
