import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import archive from './src/content/archive.json';

const site = (archive as { site: { name: string; archiveTitle: string; lede: string } }).site;

/**
 * 把 index.html 里的占位符替换成内容文件里的值，
 * 这样换人使用时只需要改 archive.json，不用再改 HTML。
 */
function contentHtml() {
  return {
    name: 'archive-content-html',
    transformIndexHtml(html: string) {
      return html
        .replaceAll('%SITE_NAME%', site.name)
        .replaceAll('%ARCHIVE_TITLE%', site.archiveTitle)
        .replaceAll('%SITE_DESC%', site.lede);
    },
  };
}

// GitHub Pages 部署在子路径下时由工作流注入 VITE_BASE，例如 /archive/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), contentHtml()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
});
