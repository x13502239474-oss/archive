import type { CSSProperties } from 'react';
import { site, projects } from '../data/content';
import { usePageMeta } from '../hooks/useSite';
import '../styles/pages.css';

export default function About() {
  usePageMeta(
    `关于 · ${site.archiveTitle}`,
    '关于这位创作者：关注方向、创作理念、正在探索的领域与常用工具。',
  );

  const year = new Date().getFullYear();

  return (
    <div className="page about">
      <div className="shell">
        <div className="about-top">
          <span className="meta">个人档案</span>
          <span className="meta">
            {site.volume} · {year}
          </span>
        </div>

        <h1 className="about-name">{site.name}</h1>
        <p className="about-lead">{site.about.intro}</p>

        <div className="about-grid">
          <aside className="about-facts">
            <dl>
              <div className="fact">
                <dt>姓名</dt>
                <dd>{site.name}</dd>
              </div>
              <div className="fact">
                <dt>身份</dt>
                <dd>独立创作者</dd>
              </div>
              <div className="fact">
                <dt>档案起始</dt>
                <dd className="num">{site.since}</dd>
              </div>
              <div className="fact">
                <dt>收录作品</dt>
                <dd className="num">{String(projects.length).padStart(2, '0')} 件</dd>
              </div>
              <div className="fact">
                <dt>所在地</dt>
                <dd>{site.location || '待补充'}</dd>
              </div>
            </dl>

            <div className="about-now">
              <span className="meta">正在做</span>
              <p>{site.now}</p>
            </div>
          </aside>

          <div className="about-prose" data-reveal="">
            {site.about.paragraphs.map((para) => (
              <p key={para.slice(0, 12)}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>关注方向</h2>
            <span className="meta">关注与探索</span>
          </div>

          <div className="about-split">
            <div className="about-split__main">
              <ul className="interests">
                {site.about.interests.map((item, i) => (
                  <li key={item} data-reveal="" style={{ '--reveal-delay': `${i * 60}ms` } as CSSProperties}>
                    <span>
                      <em>{String(i + 1).padStart(2, '0')}</em>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="about-split__side">
              <span className="meta">正在探索</span>
              <ul className="exploring">
                {site.about.exploring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>创作理念</h2>
            <span className="meta">共 {site.about.principles.length} 条</span>
          </div>

          <div className="principles">
            {site.about.principles.map((p, i) => (
              <div className="principle" key={p.title} data-reveal="">
                <span className="principle__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>常用工具</h2>
            <span className="meta">工具与技术</span>
          </div>

          <div className="tools">
            {site.about.tools.map((group) => (
              <div className="tool-group" key={group.group} data-reveal="">
                <h3>{group.group}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
