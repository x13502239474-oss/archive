# 个人数字档案馆 · 模板

一个以「数字年鉴」为概念的长期个人作品档案站。瑞士编辑设计 × 纸本文艺 × 档案馆秩序。

**这是一个模板**：任何人都能把它变成自己的档案馆，只需要改一个文件，不用写代码。

演示站：https://x13502239474-oss.github.io/archive/

---

## 三步上线

### 1. 复制仓库

点本页右上角的 **Use this template → Create a new repository**，起一个名字（比如 `archive`），选 Public。

> 用 Public 才能免费开 GitHub Pages。想私有仓库 + Pages，需要 GitHub Pro。

### 2. 加作品

上线后打开 **`https://<你的地址>/admin`**，第一次填三样东西（用户名、仓库名、令牌），之后就是：新建作品 → 填内容 → 选图 → 发布。手机上一样能用。

详见下面的「用后台加作品」。

### 3. 等它上线

推送到 `main` 后，GitHub Actions 会自动构建、自动开启 Pages 并发布。地址是：

```
https://<你的用户名>.github.io/<仓库名>/
```

子路径、路由、深链接都已经处理好了，仓库叫什么都行。

如果第一次运行失败了，去 **Settings → Pages → Source** 手动选 **GitHub Actions**，再在 Actions 页面点 **Re-run jobs**。

---

## 用后台加作品

地址：`https://<你的地址>/admin`（页脚右下角也有「管理」入口）

第一次打开要填三样东西：

| 字段 | 填什么 |
| --- | --- |
| GitHub 用户名 | 比如 `x13502239474-oss` |
| 仓库名 | 比如 `archive` |
| 访问令牌 | 见下面四步生成 |

### 生成令牌（只需一次）

1. 打开 https://github.com/settings/personal-access-tokens/new
2. Token name 随便填，Expiration 选个长一点的
3. Repository access 选 **Only select repositories**，选中你的仓库
4. Permissions → **Contents** 选 **Read and write**，然后 Generate token

复制生成的令牌粘进后台，点「连接」。令牌只存在你自己这台设备的浏览器里，不会写进代码。

### 之后每次加作品

- **新建作品**：填标题、分类、年份、简介、正文，选封面和图版
- **选图**：直接点方框选手机或电脑里的照片，会自动压缩到适合网页的尺寸（长边 1600px、JPEG）
- **比例**：每张图可以选竖版 / 横版 / 方形 / 宽幅
- **发布**：点底部「发布」，提交到仓库，约 1 分钟后线上生效

没有上传图片的槽位会自动用排版图版占位，不会出现空白块。

发布前会自动校验，字段没填完会直接提示，不会把坏数据推上去导致构建失败。

删除作品同理，在列表里点「删除」。图片文件会留在仓库里，不影响页面。

---

## 内容字段

`archive.json` 有三个顶层字段：

| 字段 | 内容 |
| --- | --- |
| `site` | 你的身份、首屏标题、联系方式、关于页正文 |
| `categories` | 作品分类，可以自由增减 |
| `projects` | 作品档案，一件作品一个对象 |

文件开头有 `"$schema": "./archive.schema.json"`，用 VS Code 打开会有字段提示和自动补全。

### 一件作品的最小结构

```json
{
  "id": "my-work",
  "code": "DP·2026·01",
  "title": "作品名",
  "titleEn": "MY WORK",
  "category": "digital-products",
  "year": 2026,
  "order": 90,
  "featured": true,
  "summary": "一句话简介，出现在列表里。",
  "description": "两三句简介，出现在详情页标题下。",
  "cover": { "id": "c1", "alt": "封面描述", "ratio": "portrait",
             "plate": { "motif": "stack", "tone": "paper" } },
  "gallery": [],
  "tags": ["工具"],
  "background": "为什么做它。",
  "designConcept": "设计上的核心决定。",
  "features": [{ "title": "功能标题", "body": "说明" }],
  "process": [{ "title": "阶段标题", "body": "说明" }],
  "technology": ["React"]
}
```

- `id` 会变成地址 `/works/my-work`，改了就换了链接
- `order` 越大越靠前；`featured: true` 进首页精选（最多取 4 件）
- `category` 必须是 `categories` 里某个 `id`
- `projectUrl` 留空时，详情页显示「暂未公开」，不会编造

### 加一个分类

在 `categories` 数组里追加：

```json
{ "index": "05", "id": "writings", "name": "文字",
  "nameEn": "Writings", "description": "长文、随笔与翻译。" }
```

筛选区、首页目录、关于页会自动出现，作品数量自动统计。

---

## 图片

每张图有两种来源，**填了 `src` 就用真实图片，没填就用生成的图版**：

```json
// 真实截图：文件放进 public/images/<作品id>/，路径以 / 开头
{ "id": "g1", "src": "/images/my-work/01.jpg", "alt": "界面截图",
  "caption": "图注", "ratio": "landscape" }

// 生成的图版：没有截图时的占位
{ "id": "g1", "alt": "界面截图", "caption": "图注", "ratio": "landscape",
  "plate": { "motif": "grid", "tone": "brick" } }
```

- `ratio`：`portrait` 4:5 / `landscape` 3:2 / `square` 1:1 / `wide` 16:9 / `tall` 2:3
- `motif`：`stack` `lines` `grid` `arcs` `letter` `bars` `orbit`
- `tone`：`paper` `ink` `brick` `navy` `olive`

图版不是假截图，是用排版语言画的封面系统——在真实截图出现之前，它比灰色占位块体面得多。有图之后逐个填 `src` 替换即可，布局不用动。

---

## 本地开发

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # 校验 archive.json
npm run build     # 生产构建
npm run preview   # 预览构建结果
npm test          # 交互自测（需要先 npm run preview）
```

---

## 换成自己的视觉

- **配色 / 字体 / 间距**：`src/styles/tokens.css`，改里面的变量即可整体换掉
- **首屏标题**：`site.headline`，数组每一项是一行
- **图版配色**：`src/components/Plate.tsx` 顶部的 `TONES`

默认是暖纸白 + 近黑 + 砖红，Newsreader（衬线）+ Archivo（无衬线）。想换成冷色或深色，只改 tokens 里的色值，组件不用动。

---

## 部署到别处

`npm run build` 后把 `dist/` 传上去即可。站点用 history 路由，需要 SPA 回退：

- Netlify / Cloudflare Pages：`public/_redirects` 已含 `/* /index.html 200`
- Vercel：`vercel.json` 已含 rewrite
- Nginx：`try_files $uri $uri/ /index.html;`

用自定义域名时，把 `VITE_BASE` 改成 `/`（工作流里那一步），否则资源会去 `/仓库名/` 下面找。

---

## 结构

```
src/
├─ content/
│  ├─ archive.json        ★ 全部内容
│  ├─ archive.schema.json   字段定义（编辑器提示用）
│  └─ validate.mjs          内容校验
├─ data/content.ts       读入 + 校验 + 派生数据
├─ pages/                Home / Works / ProjectDetail / About / Contact
├─ components/           Nav、Footer、Plate（图版）、Lightbox、Arrow
├─ hooks/useSite.ts      滚动显现、路由滚动复位、页面标题
└─ styles/               设计令牌与各页面样式
```

页面组件不直接读 JSON，只从 `data/content.ts` 取数据；所以内容怎么改都不会影响布局。

---

## 设计说明

- 一个地面（纸）、一个墨色、三个低饱和强调色
- 12 栏网格，外边距 20 / 40 / 56 / 72px 随断点递增
- 全站 0 圆角、无阴影、无渐变；只用 1px 细线分隔
- 标题与长文用衬线，编号、导航、数据用无衬线
- 移动优先：390 / 768 / 1440 三个宽度都单独调过版面

字体通过 Google Fonts 加载，国内访问慢的话可以把字体文件放进 `public/fonts/` 自托管，改 `tokens.css` 里的 `--font-display` / `--font-sans`。
