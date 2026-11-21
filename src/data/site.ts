import type { SiteLink } from '../types';

/**
 * 站点身份配置
 * ---------------------------------------------------------------------------
 * 这里的每一项都会直接显示在页面上。留空（''）时界面会渲染为“待补充”，
 * 不会编造任何信息。填写后无需改动组件。
 */
export const site = {
  /** 个人名称 / 品牌标识 */
  name: '麦克',
  /** 英文标识，用于导航与页脚 */
  nameEn: 'MIKE',
  /** 档案卷名 */
  archiveTitle: '个人数字档案馆',
  archiveTitleEn: 'Personal Digital Archive',
  /** 首屏大标题，每个字符串一行 */
  headline: ['CREATING', 'MY OWN', 'WORLD'],
  /** 首屏简介 */
  lede: '一个持续探索知识、设计与数字创造的独立创作者。这里保存着每一个作品的来由、方法与留下的痕迹。',
  /** 档案起始年份 */
  since: 2022,
  /** 当前卷次说明 */
  volume: '卷 I',
  /** 所在地。留空则隐藏。 */
  location: '',
  /** 当前正在做的事，出现在 About 与首页页脚 */
  now: '正在搭建一套属于自己的知识索引系统，并尝试让写作、排版与代码共用同一套语言。',
  email: 'hello@example.com',
  links: [
    { label: 'GitHub', value: 'github.com/yourname', href: 'https://github.com/' },
    { label: '邮件', value: 'hello@example.com', href: 'mailto:hello@example.com' },
    { label: 'X / Twitter', value: '', note: '待补充' },
    { label: '即刻', value: '', note: '待补充' },
    { label: '个人博客', value: '', note: '待补充' },
  ] satisfies SiteLink[],
  /** 关于页的正文。每个字符串是一段。 */
  about: {
    intro:
      '我不太擅长介绍自己，更习惯用做过的东西来说明。这个档案馆是我给自己的一个交代：把散落在硬盘、备忘录和浏览器书签里的创作，按年份和类别整理成可以反复翻阅的样子。',
    paragraphs: [
      '我的工作大多围绕同一件事展开——把复杂的信息重新组织成可以被理解的形式。有时候它表现为一个工具，有时候是一张图、一套排版，或者一段可以被读下去的文字。',
      '我对“长期”这件事有偏好。比起一次性的项目，我更喜欢那些能在两三年里不断被修改、补充、重新理解的东西。这个网站本身就是其中之一：它不会在某次上线后结束，而是会随着作品一起变长。',
      '在设计上，我信任秩序胜过装饰。网格、字号层级、留白和一条细线的位置，比任何特效都更能说明一个创作者是否认真。',
    ],
    /** 兴趣与关注方向 */
    interests: [
      '信息架构与知识组织',
      '编辑设计与字体排印',
      '独立产品的长期维护',
      '人机交互中的克制',
      '写作作为思考方式',
    ],
    /** 创作理念 */
    principles: [
      {
        title: '先有结构，再有风格',
        body: '任何视觉决定都应该能回答“它解决了什么问题”。如果回答不了，就去掉它。',
      },
      {
        title: '为长期而做',
        body: '一个能被维护五年的简单方案，胜过一个三个月后就无人敢改的复杂方案。',
      },
      {
        title: '留白是内容的一部分',
        body: '拥挤的页面在替读者做决定。把节奏交还给阅读本身。',
      },
      {
        title: '记录过程，而不只是结果',
        body: '作品的价值有一半藏在被放弃的方案里。档案应该保存这一半。',
      },
    ],
    /** 正在探索 */
    exploring: [
      '把个人笔记变成可检索的图谱',
      '中文长文本的网页排版尺度',
      '生成式工具在早期构思阶段的用法',
    ],
    /** 常用工具与技术 */
    tools: [
      { group: '设计', items: ['Figma', 'Illustrator', 'InDesign'] },
      { group: '开发', items: ['TypeScript', 'React', 'CSS', 'Vite'] },
      { group: '写作', items: ['Obsidian', 'Markdown'] },
      { group: '其他', items: ['Git', 'Figma Variables', 'SVG'] },
    ],
  },
};

export type Site = typeof site;
