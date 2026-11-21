/**
 * 档案数据模型
 * ---------------------------------------------------------------------------
 * 站点所有内容都从这里出发。页面组件只负责“怎么排”，不负责“写什么”。
 * 新增一件作品 = 在 src/data/projects.ts 的数组末尾追加一个 Project 对象。
 * 不需要改动任何页面布局代码。
 */

/** 作品分类标识。新增分类时同步在 categories.ts 里追加一项。 */
export type CategoryId = string;

export interface Category {
  /** 分类编号，如 01 */
  index: string;
  /** 与 Project.category 对应的唯一标识 */
  id: CategoryId;
  /** 中文名称 */
  name: string;
  /** 英文名称，用于档案目录的对照栏 */
  nameEn: string;
  /** 一句话说明，出现在首页目录与筛选区 */
  description: string;
}

/** 图版母题：在没有真实截图之前，用排版语言为作品绘制封面。 */
export type PlateMotif =
  | 'grid'
  | 'arcs'
  | 'lines'
  | 'letter'
  | 'bars'
  | 'orbit'
  | 'stack';

/** 图版色调，全部取自站点色板。 */
export type PlateTone = 'paper' | 'ink' | 'brick' | 'navy' | 'olive';

export interface Plate {
  motif: PlateMotif;
  tone: PlateTone;
  /** 母题中的强调块数量，用于制造同一母题下的差异 */
  density?: number;
}

export type ImageRatio = 'portrait' | 'landscape' | 'square' | 'wide' | 'tall';

export interface ProjectImage {
  id: string;
  /** 图片说明文字，显示在图下方 */
  caption: string;
  /** 无障碍描述 */
  alt: string;
  ratio: ImageRatio;
  /** 真实图片路径，如 /images/still-reading/01.jpg。存在时优先于 plate。 */
  src?: string;
  /** 没有真实图片时使用的生成图版 */
  plate?: Plate;
}

export interface Project {
  /** URL 标识，需唯一，使用小写连字符 */
  id: string;
  /** 档案编号，如 DP·2024·01 */
  code: string;
  title: string;
  /** 英文副题，可为空 */
  titleEn?: string;
  category: CategoryId;
  /** 创作年份，用于筛选与展示 */
  year: number;
  /** 完成月份 1-12，用于精确排序 */
  month?: number;
  /** 手动排序权重，数字越大越靠前 */
  order: number;
  /** 是否入选首页精选 */
  featured: boolean;
  /** 一句话简介，出现在列表与首页 */
  summary: string;
  /** 项目简介段落，出现在详情页首屏 */
  description: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
  tags: string[];
  /** 在线访问地址。留空则不显示访问入口。 */
  projectUrl?: string;
  /** 创作背景与目的 */
  background: string;
  /** 核心设计理念 */
  designConcept: string;
  /** 功能与内容介绍 */
  features: { title: string; body: string }[];
  /** 创作过程与思考 */
  process: { title: string; body: string }[];
  /** 使用的技术与工具 */
  technology: string[];
  /** 补充内容，可为空 */
  content?: string;
}

export interface SiteLink {
  label: string;
  /** 留空表示尚未提供，界面会显示为待补充状态 */
  value: string;
  href?: string;
  note?: string;
}

export interface AboutContent {
  /** 关于页开头的一段话 */
  intro: string;
  /** 关于页正文，每个字符串一段 */
  paragraphs: string[];
  interests: string[];
  principles: { title: string; body: string }[];
  exploring: string[];
  tools: { group: string; items: string[] }[];
}

export interface SiteContent {
  name: string;
  nameEn: string;
  archiveTitle: string;
  archiveTitleEn: string;
  /** 首屏大标题，每个字符串一行 */
  headline: string[];
  lede: string;
  since: number;
  volume: string;
  /** 所在地，留空则显示“待补充” */
  location: string;
  now: string;
  email: string;
  links: SiteLink[];
  about: AboutContent;
}

/** src/content/archive.json 的完整结构 */
export interface ArchiveContent {
  site: SiteContent;
  categories: Category[];
  projects: Project[];
}
