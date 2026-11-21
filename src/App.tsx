import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Arrow from './components/Arrow';
import Home from './pages/Home';
import Works from './pages/Works';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { usePageMeta, useRevealOnScroll, useScrollReset } from './hooks/useSite';

function NotFound() {
  usePageMeta('页面不存在 · 个人数字档案馆');
  return (
    <div className="page">
      <div className="shell notfound">
        <h1>这一页不在档案里</h1>
        <p>地址可能写错了，或者这条记录已经被移动。回到档案库可以继续查找。</p>
        <div className="notfound__actions">
          <Link to="/works" className="btn">
            前往档案库
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

export default function App() {
  const location = useLocation();
  useRevealOnScroll();
  useScrollReset();

  // 路由切换后把焦点交还给文档，避免读屏停留在旧位置
  useEffect(() => {
    const main = document.getElementById('main');
    main?.setAttribute('tabindex', '-1');
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        跳到主要内容
      </a>
      <Nav />
      <main id="main">
        <div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/works" element={<Works />} />
            <Route path="/works/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
