import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Plate from '../components/Plate';
import Arrow from '../components/Arrow';
import Lightbox from '../components/Lightbox';
import { getCategory, getProject, sortedProjects, site } from '../data/content';
import { usePageMeta } from '../hooks/useSite';
import '../styles/project.css';

const SECTIONS = [
  { id: 'background', num: '01', label: '创作背景与目的' },
  { id: 'concept', num: '02', label: '核心设计理念' },
  { id: 'features', num: '03', label: '功能与内容' },
  { id: 'plates', num: '04', label: '图版' },
  { id: 'process', num: '05', label: '创作过程与思考' },
  { id: 'tech', num: '06', label: '技术与访问' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const project = id ? getProject(id) : undefined;
  const [active, setActive] = useState('background');
  const [lightbox, setLightbox] = useState<number | null>(null);

  usePageMeta(
    project ? `${project.title} · ${site.archiveTitle}` : `未找到 · ${site.archiveTitle}`,
    project?.summary,
  );

  useEffect(() => {
    setActive('background');
    setLightbox(null);
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-18% 0px -62% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [project]);

  if (!project) {
    return (
      <div className="page">
        <div className="shell notfound">
          <h1>档案不存在</h1>
          <p>
            这个编号没有对应的记录。它可能已被移动，或者从未被收录。回到档案库可以继续查找。
          </p>
          <div className="notfound__actions">
            <Link to="/works" className="btn">
              返回档案库
              <Arrow size={22} />
            </Link>
            <Link to="/" className="btn btn--ghost">
              回到首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const p = project;
  const cat = getCategory(p.category);
  // 有真实图片时按作者选的比例展示，避免截图被裁；没有图片时用宽幅图版
  const hasRealCover = Boolean(p.cover.src);
  const coverRatio = hasRealCover ? p.cover.ratio : 'wide';
  const coverTall =
    hasRealCover && ['portrait', 'square', 'tall'].includes(p.cover.ratio);
  const index = sortedProjects.findIndex((x) => x.id === p.id);
  const prev = index > 0 ? sortedProjects[index - 1] : null;
  const next = index < sortedProjects.length - 1 ? sortedProjects[index + 1] : null;

  const related = [
    ...sortedProjects.filter((x) => x.id !== p.id && x.category === p.category),
    ...sortedProjects.filter((x) => x.id !== p.id && x.category !== p.category),
  ].slice(0, 3);

  return (
    <div className="page project">
      <div className="shell">
        <div className="proj-top">
          <Link to="/works" className="proj-back">
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
              <path d="M22 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1" />
            </svg>
            全部作品
          </Link>
          <span className="meta">
            {p.code} · {p.year}
          </span>
        </div>

        <header className="proj-head">
          <div className="proj-head__main">
            <h1 className="proj-title">{p.title}</h1>
            <p className="proj-lead">{p.description}</p>
          </div>

          <dl className="proj-facts">
            <div className="fact">
              <dt>档案编号</dt>
              <dd className="num">{p.code}</dd>
            </div>
            <div className="fact">
              <dt>分类</dt>
              <dd>
                {cat.index} · {cat.name}
              </dd>
            </div>
            <div className="fact">
              <dt>创作年份</dt>
              <dd className="num">{p.year}</dd>
            </div>
            <div className="fact">
              <dt>标签</dt>
              <dd>{p.tags.slice(0, 3).join(' · ')}</dd>
            </div>
            <div className="fact">
              <dt>状态</dt>
              <dd>{p.projectUrl ? '已发布' : '收录中'}</dd>
            </div>
          </dl>
        </header>

      </div>

      <div className="shell">
        <figure className={`proj-cover ${coverTall ? 'proj-cover--tall' : ''}`} data-reveal="">
          <Plate
            data={p.cover.plate}
            src={p.cover.src}
            alt={p.cover.alt}
            ratio={coverRatio}
            seed={p.code}
            label={p.code}
            glyph={p.titleEn?.[0] ?? p.title[0]}
            eager
          />
          <figcaption className="proj-cover__cap">
            <span className="meta">封面图版 · {p.code}</span>
            <span className="meta">
              {cat.name} / {p.year}
            </span>
          </figcaption>
        </figure>

        <div className="proj-body">
          <nav className="proj-toc" aria-label="本页目录">
            <span className="proj-toc__label meta">目录</span>
            <ol>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    data-active={active === s.id}
                    onClick={() => setActive(s.id)}
                  >
                    <span className="proj-toc__num">{s.num}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="proj-content">
            <section className="psec" id="background" data-reveal="">
              <div className="psec__head">
                <span className="psec__num">01</span>
                <h2>创作背景与目的</h2>
              </div>
              <div className="psec__body">
                <p className="prose">{p.background}</p>
              </div>
            </section>

            <section className="psec" id="concept" data-reveal="">
              <div className="psec__head">
                <span className="psec__num">02</span>
                <h2>核心设计理念</h2>
              </div>
              <div className="psec__body">
                <p className="prose">{p.designConcept}</p>
              </div>
            </section>

            <section className="psec" id="features" data-reveal="">
              <div className="psec__head">
                <span className="psec__num">03</span>
                <h2>功能与内容</h2>
              </div>
              <ul className="features">
                {p.features.map((f, i) => (
                  <li className="feature" key={f.title}>
                    <span className="feature__num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pgal-sec" id="plates">
              <div className="psec__head pgal-sec__head">
                <span className="psec__num">04</span>
                <h2>图版</h2>
                <span className="meta pgal-sec__count">
                  共 {String(p.gallery.length).padStart(2, '0')} 张
                </span>
              </div>

              <div className="pgal">
                {p.gallery.map((img, i) => (
                  <figure className="pgal__item" key={img.id} data-reveal="">
                    <button
                      type="button"
                      className="pgal__btn"
                      onClick={() => setLightbox(i)}
                      aria-label={`放大查看：${img.caption}`}
                    >
                      <Plate
                        data={img.plate}
                        src={img.src}
                        alt={img.alt}
                        ratio={img.ratio}
                        seed={img.id}
                      />
                    </button>
                    <figcaption className="pgal__cap">
                      <span className="pgal__idx">{String(i + 1).padStart(2, '0')}</span>
                      {img.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="psec" id="process" data-reveal="">
              <div className="psec__head">
                <span className="psec__num">05</span>
                <h2>创作过程与思考</h2>
              </div>
              <ol className="process">
                {p.process.map((s, i) => (
                  <li key={s.title}>
                    <span className="process__num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="psec" id="tech" data-reveal="">
              <div className="psec__head">
                <span className="psec__num">06</span>
                <h2>技术与访问</h2>
              </div>
              <ul className="tech">
                {p.technology.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className="access">
                {p.projectUrl ? (
                  <a
                    className="btn"
                    href={p.projectUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    在线访问
                    <Arrow size={22} />
                  </a>
                ) : (
                  <p className="access__note">
                    线上版本暂未公开。这一条记录仍在整理中，完整内容会随档案一起更新。
                  </p>
                )}
              </div>
            </section>

            {p.content ? (
              <section className="psec">
                <div className="psec__head">
                  <span className="psec__num">07</span>
                  <h2>补记</h2>
                </div>
                <div className="psec__body">
                  <p className="prose">{p.content}</p>
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <div className="pager">
          {prev ? (
            <Link to={`/works/${prev.id}`}>
              <span className="meta">← 上一件 · {prev.code}</span>
              <span className="pager__title">{prev.title}</span>
            </Link>
          ) : (
            <Link to="/works">
              <span className="meta">← 返回</span>
              <span className="pager__title">全部作品</span>
            </Link>
          )}
          {next ? (
            <Link to={`/works/${next.id}`}>
              <span className="meta">下一件 · {next.code} →</span>
              <span className="pager__title">{next.title}</span>
            </Link>
          ) : null}
        </div>
      </div>

      <section className="related">
        <div className="shell">
          <div className="section-head">
            <h2>相关档案</h2>
            <span className="meta">
              共 {String(related.length).padStart(2, '0')} 件
            </span>
          </div>
          <div className="related__grid">
            {related.map((r) => {
              const rc = getCategory(r.category);
              return (
                <Link key={r.id} to={`/works/${r.id}`} className="rwork plate-hover" data-reveal="">
                  <Plate
                    data={r.cover.plate}
                    src={r.cover.src}
                    alt={r.cover.alt}
                    ratio="landscape"
                    seed={r.code}
                    label={r.code}
                    glyph={r.titleEn?.[0] ?? r.title[0]}
                  />
                  <h3 className="rwork__title">{r.title}</h3>
                  <div className="rwork__meta">
                    <span className="meta">{rc.name}</span>
                    <span className="meta num">{r.year}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {lightbox !== null ? (
        <Lightbox
          images={p.gallery}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
