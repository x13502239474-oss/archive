import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Plate from '../components/Plate';
import Arrow from '../components/Arrow';
import {
  site,
  categories,
  getCategory,
  featuredProjects,
  projects,
  countByCategory,
} from '../data/content';
import { usePageMeta } from '../hooks/useSite';
import '../styles/home.css';

const LAYOUTS = [
  { cls: 'a', ratio: 'landscape' as const },
  { cls: 'b', ratio: 'portrait' as const },
  { cls: 'c', ratio: 'wide' as const },
  { cls: 'd', ratio: 'square' as const },
];

/** 给元素加上进入视口的显现效果 */
const reveal = (i = 0) => ({
  'data-reveal': '',
  style: { '--reveal-delay': `${i * 70}ms` } as CSSProperties,
});

export default function Home() {
  usePageMeta(
    `${site.name} · ${site.archiveTitle}`,
    '一个持续更新的个人数字作品档案馆：数字产品、学习项目、创意作品与技术实验。',
  );

  const year = new Date().getFullYear();
  const years = projects.map((p) => p.year);
  const span = `${Math.min(...years)}—${Math.max(...years)}`;
  const lead = featuredProjects[0];
  const leadCategory = getCategory(lead.category);

  return (
    <div className="page">
      {/* 首屏 ------------------------------------------------------------- */}
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__rail">
            <span className="meta">{site.archiveTitle}</span>
            <span className="meta">
              Est. {site.since} · {site.volume}
            </span>
            <span className="meta">{year}</span>
          </div>

          <div className="hero__main">
            <h1 className="hero__title display">
              {site.headline.map((line, i) => (
                <span
                  key={line}
                  className={`hero__line ${i === 1 ? 'hero__line--indent' : ''}`}
                >
                  {line}
                  {i === site.headline.length - 1 ? (
                    <span className="hero__dot">.</span>
                  ) : null}
                </span>
              ))}
            </h1>

            <div className="hero__foot">
              <div>
                <p className="hero__lede">{site.lede}</p>
                <p className="meta hero__focus">
                  关注 · 信息架构 / 编辑设计 / 独立产品
                </p>
              </div>

              <dl className="hero__stats">
                <div className="hero__stat">
                  <dt className="meta">作品</dt>
                  <dd className="num">{String(projects.length).padStart(2, '0')}</dd>
                </div>
                <div className="hero__stat">
                  <dt className="meta">分类</dt>
                  <dd className="num">{String(categories.length).padStart(2, '0')}</dd>
                </div>
                <div className="hero__stat">
                  <dt className="meta">跨度</dt>
                  <dd className="num">{span}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="hero__aside" {...reveal(1)}>
            <Link to={`/works/${lead.id}`} aria-label={`${lead.title} · 查看档案`}>
              <Plate
                data={lead.cover.plate}
                src={lead.cover.src}
                alt={lead.cover.alt}
                ratio="portrait"
                seed={lead.code}
                label={lead.code}
                glyph={lead.titleEn?.[0] ?? lead.title[0]}
                hover
                eager
              />
            </Link>
            <div className="hero__aside-cap">
              <span className="meta">图版 · {lead.title}</span>
              <span className="meta">
                {leadCategory.name} / {lead.year}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 精选作品 --------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="section-head" {...reveal()}>
            <h2>精选作品</h2>
            <span className="meta">
              Selected Works · {String(featuredProjects.length).padStart(2, '0')}
            </span>
          </div>

          <div className="works-list">
            {featuredProjects.map((p, i) => {
              const layout = LAYOUTS[i % LAYOUTS.length];
              const cat = getCategory(p.category);
              return (
                <article
                  className={`work work--${layout.cls}`}
                  key={p.id}
                  {...reveal(i % 2)}
                >
                  <Link
                    to={`/works/${p.id}`}
                    className="work__link plate-hover"
                    aria-label={`${p.title} · ${cat.name} · ${p.year}`}
                  >
                    <div className="work__media">
                      <Plate
                        data={p.cover.plate}
                        src={p.cover.src}
                        alt={p.cover.alt}
                        ratio={layout.ratio}
                        seed={p.code}
                        glyph={p.titleEn?.[0] ?? p.title[0]}
                      />
                    </div>

                    <div className="work__info">
                      <div className="work__top">
                        <span className="meta">{p.code}</span>
                        <span className="meta">
                          {cat.name} · {p.year}
                        </span>
                      </div>
                      <h3 className="work__title">
                        {p.title}
                        {p.titleEn ? <em>{p.titleEn}</em> : null}
                      </h3>
                      <p className="work__summary">{p.summary}</p>
                      <span className="work__more">
                        查看档案
                        <Arrow size={22} />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 分类目录 --------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="section-head" {...reveal()}>
            <h2>档案目录</h2>
            <span className="meta">
              Index by Category · {String(projects.length).padStart(2, '0')} Records
            </span>
          </div>

          <div className="index-table">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/works?category=${c.id}`}
                className="index-row"
                aria-label={`${c.name} · ${countByCategory(c.id)} 件作品`}
                {...reveal(i)}
              >
                <span className="index-row__num">{c.index}</span>
                <span className="index-row__name">
                  {c.name}
                  <span>{c.nameEn}</span>
                </span>
                <span className="index-row__desc">{c.description}</span>
                <span className="index-row__count">
                  {String(countByCategory(c.id)).padStart(2, '0')} 件
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 陈述 ------------------------------------------------------------- */}
      <section className="statement">
        <div className="shell statement__grid">
          <p className="statement__text" {...reveal()}>
            我不太擅长介绍自己，更习惯用做过的东西来说明。这里的每一件作品，都保留着它被想出来、被放弃、又被重做的那部分。
          </p>
          <div className="statement__side" {...reveal(1)}>
            <span className="meta">关于 / About</span>
            <Link to="/about" className="statement__link">
              阅读完整自述
              <Arrow size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 进入档案 --------------------------------------------------------- */}
      <section className="enter">
        <div className="shell">
          <Link to="/works" className="enter__link" {...reveal()}>
            <div className="enter__inner">
              <span className="enter__label">完整作品档案库</span>
              <Arrow size={54} className="enter__arrow" />
            </div>
            <div className="enter__meta">
              <span className="meta">
                {String(projects.length).padStart(2, '0')} 件作品
              </span>
              <span className="meta">
                {String(categories.length).padStart(2, '0')} 个分类
              </span>
              <span className="meta">{span}</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
