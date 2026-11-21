/**
 * 内容校验（纯 JS，不依赖 TypeScript 运行环境）
 * ---------------------------------------------------------------------------
 * 被两处使用：
 *   1. src/data/content.ts —— 启动/构建时校验，出错直接失败；
 *   2. scripts/check-content.mjs —— npm run check，给出可读的错误列表。
 * 返回值是问题描述数组，空数组表示内容合法。
 */

const RATIOS = ['portrait', 'landscape', 'square', 'wide', 'tall'];
const MOTIFS = ['grid', 'arcs', 'lines', 'letter', 'bars', 'orbit', 'stack'];
const TONES = ['paper', 'ink', 'brick', 'navy', 'olive'];

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isTextArray = (v) => Array.isArray(v) && v.length > 0 && v.every(isText);

export function validateArchive(input) {
  const issues = [];
  const add = (path, message) => issues.push(`${path} — ${message}`);

  if (!input || typeof input !== 'object') return ['文件根节点必须是一个 JSON 对象'];
  const data = input;

  // ---- site -------------------------------------------------------------
  const site = data.site;
  if (!site) {
    add('site', '缺少这个字段');
  } else {
    ['name', 'nameEn', 'archiveTitle', 'archiveTitleEn', 'lede', 'volume', 'email'].forEach((k) => {
      if (!isText(site[k])) add(`site.${k}`, '必须是非空字符串');
    });
    if (!isTextArray(site.headline)) add('site.headline', '必须是至少一行的字符串数组');
    if (typeof site.since !== 'number') add('site.since', '必须是数字年份');
    if (!Array.isArray(site.links)) add('site.links', '必须是数组（可为空数组）');

    const about = site.about;
    if (!about) {
      add('site.about', '缺少这个字段');
    } else {
      if (!isText(about.intro)) add('site.about.intro', '必须是非空字符串');
      if (!isTextArray(about.paragraphs)) add('site.about.paragraphs', '必须是字符串数组');
      if (!isTextArray(about.interests)) add('site.about.interests', '必须是字符串数组');
      if (!isTextArray(about.exploring)) add('site.about.exploring', '必须是字符串数组');
      if (!Array.isArray(about.principles)) add('site.about.principles', '必须是数组');
      if (!Array.isArray(about.tools)) add('site.about.tools', '必须是数组');
    }
  }

  // ---- categories -------------------------------------------------------
  const cats = data.categories;
  const catIds = new Set();
  if (!Array.isArray(cats) || cats.length === 0) {
    add('categories', '至少需要一个分类');
  } else {
    cats.forEach((c, i) => {
      const at = `categories[${i}]`;
      if (!isText(c?.id)) add(`${at}.id`, '必须是非空字符串（作品的 category 要填它）');
      else if (catIds.has(c.id)) add(`${at}.id`, `与前面的分类重复：${c.id}`);
      else catIds.add(c.id);
      ['index', 'name', 'nameEn', 'description'].forEach((k) => {
        if (!isText(c?.[k])) add(`${at}.${k}`, '必须是非空字符串');
      });
    });
  }

  // ---- projects ---------------------------------------------------------
  const projects = data.projects;
  if (!Array.isArray(projects)) {
    add('projects', '必须是数组（可为空数组）');
  } else {
    const ids = new Set();
    projects.forEach((p, i) => {
      const at = `projects[${i}]${p?.title ? `（${p.title}）` : ''}`;
      if (!isText(p?.id)) add(`${at}.id`, '必须是非空字符串');
      else if (ids.has(p.id)) add(`${at}.id`, `与前面的作品重复：${p.id}`);
      else ids.add(p.id);

      ['code', 'title', 'summary', 'description', 'background', 'designConcept'].forEach((k) => {
        if (!isText(p?.[k])) add(`${at}.${k}`, '必须是非空字符串');
      });

      if (!isText(p?.category)) add(`${at}.category`, '必须填写分类 id');
      else if (catIds.size && !catIds.has(p.category))
        add(`${at}.category`, `找不到这个分类：${p.category}`);

      if (typeof p?.year !== 'number') add(`${at}.year`, '必须是数字年份');
      if (typeof p?.order !== 'number') add(`${at}.order`, '必须是数字（越大越靠前）');
      if (typeof p?.featured !== 'boolean') add(`${at}.featured`, '必须是 true 或 false');
      if (!Array.isArray(p?.tags)) add(`${at}.tags`, '必须是字符串数组');

      const checkImage = (img, path) => {
        if (!img || typeof img !== 'object') return add(path, '必须是一个图片对象');
        if (!isText(img.alt)) add(`${path}.alt`, '必须填写（无障碍描述）');
        if (!RATIOS.includes(img.ratio))
          add(`${path}.ratio`, `必须是 ${RATIOS.join(' / ')} 之一`);
        if (!img.src && !img.plate) add(path, 'src 与 plate 至少填一个');
        if (img.plate) {
          if (!MOTIFS.includes(img.plate.motif))
            add(`${path}.plate.motif`, `必须是 ${MOTIFS.join(' / ')} 之一`);
          if (!TONES.includes(img.plate.tone))
            add(`${path}.plate.tone`, `必须是 ${TONES.join(' / ')} 之一`);
        }
      };

      if (!p?.cover) add(`${at}.cover`, '缺少封面');
      else checkImage(p.cover, `${at}.cover`);

      if (!Array.isArray(p?.gallery)) add(`${at}.gallery`, '必须是数组（可为空数组）');
      else p.gallery.forEach((img, j) => checkImage(img, `${at}.gallery[${j}]`));

      if (!Array.isArray(p?.features)) add(`${at}.features`, '必须是数组');
      if (!Array.isArray(p?.process)) add(`${at}.process`, '必须是数组');
      if (!Array.isArray(p?.technology)) add(`${at}.technology`, '必须是字符串数组');
    });
  }

  return issues;
}
