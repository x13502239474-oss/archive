/**
 * npm run check
 * ---------------------------------------------------------------------------
 * 只校验内容文件，不启动开发服务器、不构建。
 * 适合改完 archive.json 后立刻确认有没有写错。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateArchive } from '../src/content/validate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, '../src/content/archive.json');

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error('\n✗ 内容文件不是合法的 JSON：');
  console.error('  ' + (e instanceof Error ? e.message : String(e)));
  console.error('\n  常见原因：多了一个逗号、少了一个引号、用了中文标点。');
  console.error('  可以粘贴到 https://jsonlint.com 检查。\n');
  process.exit(1);
}

const issues = validateArchive(data);

if (issues.length === 0) {
  const p = Array.isArray(data.projects) ? data.projects.length : 0;
  const c = Array.isArray(data.categories) ? data.categories.length : 0;
  console.log(`\n✓ 内容校验通过：${c} 个分类，${p} 件作品。\n`);
  process.exit(0);
}

console.error(`\n✗ 发现 ${issues.length} 处问题：\n`);
issues.forEach((i) => console.error('  · ' + i));
console.error('\n  字段说明见 README.md 的「内容字段」一节。\n');
process.exit(1);
