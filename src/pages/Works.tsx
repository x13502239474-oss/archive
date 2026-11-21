import { useMemo, type CSSProperties } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Plate from '../components/Plate';
import Arrow from '../components/Arrow';
import { categories, getCategory } from '../data/categories';
import { projects, archiveYears, countByCategory } from '../data/projects';
import { site } from '../data/site';
import { usePageMeta } from '../hooks/useSite';
import type { ImageRatio } from '../types';
import '../styles/archive.css';

/** 画廊节奏：7+5、5+7、12 三行循环，正好铺满 12 栏 */
const PATTERN: { span: number; ratio: ImageRatio; wide: boolean }[] = [
  { span: 7, ratio: 'wide', wide: true },
  { span: 5, ratio: 'portrait', wide: false },
  { span: 5, ratio: 'portrait', wide: false },
  { span: 7, ratio: 'wide', wide: true },
  { span: 12, ratio: 'wide', wide: true },
];

const SORTS = [
  { id: 'curated', label: '策划顺序' },
  { id: 'new', label: '最新在前' },
  { id: 'old', label: '最早在前' },
  { id: 'code', label: '按编号' },
];

const reveal = (i = 0) => ({
  'data-reveal': '',
  style: { '--reveal-delay': `${i * 60}ms` } as CSSProperties,
});

export default function Works() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = params.get('mode') === 'index' ? 'index' : 'gallery';
  const category = params.get('category') ?? '';
  const year = params.get('year') ?? '';
  const sort = params.get('sort') ?? 'curated';
  const query = params.get('q') ?? '';

  usePageMeta(
    mode === 'index'
      ? `档案目录 · ${site.archiveTitle}`
      : `作品 · ${site.archiveTitle}`,
    '按分类、年份与关键词检索全部作品档案。',
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const isDefault =
      value === '' ||
      (key === 'mode' && value === 'gallery') ||
      (key === 'sort' && value === 'curated');
    if (isDefault) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const reset = () => {
    const next = new URLSearchParams();
    if (mode === 'index') next.set('mode', 'index');
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (category && p.category !== category) return false;
      if (year && String(p.year) !== year) return false;
      if (!term) return true;
      const cat = getCategory(p.category);
      const haystack = [
        p.title,
        p.titleEn ?? '',
        p.summary,
        p.description,
        p.code,
        cat.name,
        cat.nameEn,
        ...p.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'new':
          return b.year - a.year || (b.month ?? 0) - (a.month ?? 0);
        case 'old':
          return a.year - b.year || (a.month ?? 0) - (b.month ?? 0);
        case 'code':
          return a.code.localeCompare(b.code);
        default:
          return b.order - a.order;
      }
    });

    return list;
  }, [category, year, query, sort]);

  const activeCategory = category ? getCategory(category) : null;
  const heading = mode === 'index' ? '档案目录' : '作品';

  return (
    <div className="page archive">
      <header className="shell arc-head">
        <div className="arc-head__top">
          <span className="meta">Works &amp; Archive</span>
          <span className="meta">
            {String(projects.length).padStart(2, '0')} Records ·{' '}
            {Math.min(...archiveYears)}—{Math.max(...archiveYears)}
          </span>
        </div>

        <h1 className="arc-head__title">{heading}</h1>

        <div className="arc-head__row">
          <p className="arc-head__lede">
            {mode === 'index'
              ? '全部作品的目录式索引。按编号、类别与年份排列，适合查找与比对。'
              : '每一件作品都有自己的档案身份。以封面浏览，或切换到目录查看完整索引。'}
          </p>
          <button
            type="button"
            className="random"
            onClick={() => {
              const pick = projects[Math.floor(Math.random() * projects.length)];
              navigate(`/works/${pick.id}`);
            }}
          >
            随机调阅一件
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 7a6 6 0 0 1 10.2-4.3M13 7A6 6 0 0 1 2.8 11.3"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path d="M11.4 1v2.6H8.8M2.6 13v-2.6h2.6" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </header>

      {/* 工具条 --------------------------------------------------------- */}
      <div className="shell arc-bar">
        <div className="arc-bar__row">
          <div className="modes" role="group" aria-label="浏览模式">
            <button
              type="button"
              aria-pressed={mode === 'gallery'}
              onClick={() => update('mode', 'gallery')}
            >
              Gallery
            </button>
            <button
              type="button"
              aria-pressed={mode === 'index'}
              onClick={() => update('mode', 'index')}
            >
              Index
            </button>
          </div>

          <div className="search">
            <label className="search__label" htmlFor="archive-search">
              搜索
            </label>
            <input
              id="archive-search"
              type="search"
              value={query}
              placeholder="标题、编号或标签"
              onChange={(e) => update('q', e.target.value)}
            />
          </div>
        </div>

        <div className="filters">
          <div className="fgroup" role="group" aria-label="按分类筛选">
            <span className="fgroup__label">分类</span>
            <div className="fgroup__items">
              <button
                type="button"
                className="fbtn"
                aria-pressed={!category}
                onClick={() => update('category', '')}
              >
                全部
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="fbtn"
                  aria-pressed={category === c.id}
                  onClick={() => update('category', category === c.id ? '' : c.id)}
                >
                  {c.name}
                  <span className="n">{countByCategory(c.id)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fgroup" role="group" aria-label="按年份筛选">
            <span className="fgroup__label">年份</span>
            <div className="fgroup__items">
              <button
                type="button"
                className="fbtn"
                aria-pressed={!year}
                onClick={() => update('year', '')}
              >
                全部
              </button>
              {archiveYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  className="fbtn"
                  aria-pressed={year === String(y)}
                  onClick={() => update('year', year === String(y) ? '' : String(y))}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <label className="fgroup__label" htmlFor="archive-sort">
              排序
            </label>
            <div className="fgroup__items">
              <select
                id="archive-sort"
                className="sort"
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 结果 ----------------------------------------------------------- */}
      <div className="shell">
        <div className="arc-count">
          <span className="meta">
            {String(filtered.length).padStart(2, '0')} 件
            {activeCategory ? ` · ${activeCategory.name}` : ''}
            {year ? ` · ${year}` : ''}
            {query ? ` · “${query}”` : ''}
          </span>
          <span className="meta">
            共 {String(projects.length).padStart(2, '0')} 件
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h2 className="empty__title">没有找到匹配的档案</h2>
            <p className="empty__text">
              试着换一个关键词，或清除分类与年份的限制。所有作品都在这里，只是暂时被筛掉了。
            </p>
            <button type="button" className="empty__reset" onClick={reset}>
              清除全部筛选
              <Arrow size={20} />
            </button>
          </div>
        ) : mode === 'gallery' ? (
          <div className="gallery">
            {filtered.map((p, i) => {
              const layout = PATTERN[i % PATTERN.length];
              const cat = getCategory(p.category);
              return (
                <Link
                  key={p.id}
                  to={`/works/${p.id}`}
                  className={`gcard plate-hover ${layout.wide ? 'gcard--wide' : ''} ${
                    layout.ratio === 'portrait' ? 'gcard--portrait' : ''
                  }`}
                  data-reveal=""
                  style={
                    {
                      '--span': layout.span,
                      '--reveal-delay': `${(i % 3) * 60}ms`,
                    } as CSSProperties
                  }
                  aria-label={`${p.title} · ${cat.name} · ${p.year}`}
                >
                  <div className="gcard__media">
                    <Plate
                      data={p.cover.plate}
                      src={p.cover.src}
                      alt={p.cover.alt}
                      ratio={layout.ratio}
                      seed={p.code}
                      glyph={p.titleEn?.[0] ?? p.title[0]}
                    />
                  </div>
                  <div className="gcard__meta">
                    <span className="meta">{p.code}</span>
                    <span className="meta">
                      {p.featured ? <span className="mark">精选 · </span> : null}
                      {cat.name} · {p.year}
                    </span>
                  </div>
                  <h2 className="gcard__title">
                    {p.title}
                    {p.titleEn ? <em>{p.titleEn}</em> : null}
                  </h2>
                  <p className="gcard__summary">{p.summary}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="idx">
            <div className="idx__head" aria-hidden="true">
              <span>编号</span>
              <span>作品</span>
              <span>分类</span>
              <span>年份</span>
              <span>简介</span>
              <span />
            </div>
            {filtered.map((p) => {
              const cat = getCategory(p.category);
              return (
                <Link
                  key={p.id}
                  to={`/works/${p.id}`}
                  className="idx__row"
                  aria-label={`${p.title} · ${cat.name} · ${p.year}`}
                  {...reveal(0)}
                >
                  <span className="idx__code">
                    {p.code}
                    {p.featured ? <span className="mark"> 精选</span> : null}
                  </span>
                  <span className="idx__title">
                    {p.title}
                    {p.titleEn ? <em>{p.titleEn}</em> : null}
                  </span>
                  <span className="idx__cat">{cat.name}</span>
                  <span className="idx__year num">{p.year}</span>
                  <span className="idx__desc">{p.summary}</span>
                  <span className="idx__arrow">
                    <Arrow size={22} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
