import { Link } from 'react-router-dom';
import { site, projects } from '../data/content';
import '../styles/footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__inner">
          <div className="footer__row">
            <span className="meta">继续记录中 · Ongoing</span>
            <a className="footer__mail link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>

          <Link to="/" className="footer__name" aria-label={`${site.name} · 返回首页`}>
            {site.name}
          </Link>

          <div className="footer__cols">
            <div className="footer__col">
              <h3>目录</h3>
              <ul>
                <li>
                  <Link to="/works">作品</Link>
                </li>
                <li>
                  <Link to="/works?mode=index">档案目录</Link>
                </li>
                <li>
                  <Link to="/about">关于</Link>
                </li>
                <li>
                  <Link to="/contact">联系</Link>
                </li>
              </ul>
            </div>

            <div className="footer__col">
              <h3>别处</h3>
              <ul>
                {site.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noreferrer noopener">
                        {l.label}
                      </a>
                    ) : (
                      <span className="is-pending">{l.label} · 待补充</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h3>档案</h3>
              <ul>
                <li>
                  <span className="num">{projects.length} 件作品</span>
                </li>
                <li>
                  <span className="num">
                    {Math.min(...projects.map((p) => p.year))}—
                    {Math.max(...projects.map((p) => p.year))}
                  </span>
                </li>
                <li>
                  <span>{site.volume} · 持续更新</span>
                </li>
              </ul>
            </div>

            <div className="footer__col">
              <h3>说明</h3>
              <ul>
                <li>
                  <span>本站图片为图版占位</span>
                </li>
                <li>
                  <span>内容随作品持续增补</span>
                </li>
                <li>
                  <span>文字与版式保留所有权利</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <span className="meta">
              © {year} {site.nameEn}
            </span>
            <span className="meta">
              {site.archiveTitle} · {site.archiveTitleEn}
              <Link to="/admin" className="footer__admin">
                管理
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
