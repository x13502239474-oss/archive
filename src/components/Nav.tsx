import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { site } from '../data/content';
import '../styles/nav.css';

const LINKS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'works', label: 'Works', to: '/works' },
  { key: 'archive', label: 'Archive', to: '/works?mode=index' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'contact', label: 'Contact', to: '/contact' },
];

const Arrow = () => (
  <svg
    className="menu__arrow"
    width="18"
    height="10"
    viewBox="0 0 18 10"
    fill="none"
    aria-hidden="true"
  >
    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default function Nav() {
  const { pathname, search } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const mode = new URLSearchParams(search).get('mode');
  const isActive = (key: string) => {
    switch (key) {
      case 'home':
        return pathname === '/';
      case 'works':
        return pathname.startsWith('/works') && mode !== 'index';
      case 'archive':
        return pathname === '/works' && mode === 'index';
      case 'about':
        return pathname === '/about';
      case 'contact':
        return pathname === '/contact';
      default:
        return false;
    }
  };

  return (
    <>
      <header className="nav" data-scrolled={scrolled}>
        <div className="nav__inner">
          <Link to="/" className="nav__brand" aria-label={`${site.name} · 返回首页`}>
            <span className="nav__name">{site.name}</span>
            <span className="nav__sep" aria-hidden="true" />
            <span className="nav__sub">{site.archiveTitleEn}</span>
          </Link>

          <nav className="nav__links" aria-label="主导航">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className="nav__link"
                aria-current={isActive(l.key) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav__toggle-label">{open ? 'Close' : 'Index'}</span>
            <span className="nav__glyph" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {open ? (
        <div className="menu" id="site-menu" data-open="true">
          <div className="menu__top">
            <span className="nav__name">{site.name}</span>
            <button
              type="button"
              className="menu__close"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
            >
              <span>Close</span>
              <span className="nav__glyph" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>

          <div className="menu__body">
            <ul className="menu__list">
              {LINKS.map((l, i) => (
                <li className="menu__item" key={l.key}>
                  <Link
                    to={l.to}
                    className="menu__link"
                    aria-current={isActive(l.key) ? 'page' : undefined}
                  >
                    <span className="menu__idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="menu__label">
                      {l.label}
                      <em>
                        {l.key === 'works'
                          ? '作品画廊'
                          : l.key === 'archive'
                            ? '档案目录'
                            : l.key === 'about'
                              ? '关于'
                              : l.key === 'contact'
                                ? '联系'
                                : '首页'}
                      </em>
                    </span>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="menu__foot">
              <span className="meta">{site.email}</span>
              <span className="meta">
                {site.volume} · {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
