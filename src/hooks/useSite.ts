import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 为页面上所有 [data-reveal] 元素建立进入视口的观察。
 * 路由切换后重新绑定，确保新页面的元素也会被观察。
 */
export function useRevealOnScroll() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'),
    );
    if (nodes.length === 0) return;

    const show = (el: Element) => el.classList.add('is-in');

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );

    nodes.forEach((n) => io.observe(n));

    // 兜底：若观察器没有触发（例如页面被整页截图或快速跳转），滚动时补上
    let frame = 0;
    const sweep = () => {
      frame = 0;
      const limit = window.innerHeight * 0.94;
      nodes.forEach((n) => {
        if (n.classList.contains('is-in')) return;
        if (n.getBoundingClientRect().top < limit) show(n);
      });
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const timer = window.setTimeout(sweep, 900);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname, search]);
}

/** 路由切换时回到页面顶部（不触发平滑滚动） */
export function useScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
}

/** 简单的文档标题与描述管理 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute('content', description);
    }
  }, [title, description]);
}
