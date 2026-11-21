import type { Category } from '../types';

/**
 * 作品分类
 * ---------------------------------------------------------------------------
 * 分类是开放结构：在数组里追加一项即可出现在筛选区、首页目录和 About 页。
 * 编号（index）只用于展示，保持两位数即可。
 */
export const categories: Category[] = [
  {
    index: '01',
    id: 'digital-products',
    name: '数字产品',
    nameEn: 'Digital Products',
    description: '个人数字产品、网页应用与实用工具。',
  },
  {
    index: '02',
    id: 'learning-projects',
    name: '学习项目',
    nameEn: 'Learning Projects',
    description: '个人学习平台、知识体系与课程网页。',
  },
  {
    index: '03',
    id: 'creative-works',
    name: '创意作品',
    nameEn: 'Creative Works',
    description: '创意设计、视觉作品、原创世界观与写作。',
  },
  {
    index: '04',
    id: 'experiments',
    name: '技术实验',
    nameEn: 'Experiments',
    description: '技术实验、AI 探索、交互设计与其他尝试。',
  },
];

export const categoryMap = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category {
  return (
    categoryMap.get(id) ?? {
      index: '00',
      id,
      name: id,
      nameEn: id,
      description: '',
    }
  );
}
