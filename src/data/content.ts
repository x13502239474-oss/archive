import raw from '../content/archive.json';
import { validateArchive } from '../content/validate.mjs';
import type { ArchiveContent, Category, Project } from '../types';

/**
 * 内容入口
 * ---------------------------------------------------------------------------
 * 所有可编辑的内容都在 src/content/archive.json，本文件只负责：
 * 1. 校验内容格式，出错时给出可读的提示；
 * 2. 提供页面需要的派生数据（排序、筛选、统计）。
 *
 * 页面组件不直接读取 JSON，只从这里取数据。
 */

const issues = validateArchive(raw);

if (issues.length > 0) {
  throw new Error(
    [
      `内容文件 src/content/archive.json 有 ${issues.length} 处问题：`,
      ...issues.map((i) => '  · ' + i),
      '',
      '改完再运行 npm run dev；也可以单独运行 npm run check 只看校验结果。',
    ].join('\n'),
  );
}

const data = raw as unknown as ArchiveContent;

export const site = data.site;
export const categories = data.categories;
export const projects = data.projects;

/** 默认顺序：order 降序 */
export const sortedProjects: Project[] = [...projects].sort((a, b) => b.order - a.order);

export const featuredProjects: Project[] = sortedProjects.filter((p) => p.featured).slice(0, 4);

export const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

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

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** 所有出现过的年份，降序 */
export const archiveYears: number[] = Array.from(
  new Set(projects.map((p) => p.year)),
).sort((a, b) => b - a);

export function countByCategory(id: string): number {
  return projects.filter((p) => p.category === id).length;
}
