/**
 * 资源路径
 * ---------------------------------------------------------------------------
 * 内容里的图片路径统一写成站点相对路径（/images/xxx.jpg），
 * 由这里补上部署前缀。这样同一份内容既能跑在根路径，也能跑在
 * GitHub Pages 的 /仓库名/ 子路径下。
 */

export function withBase(path?: string): string | undefined {
  if (!path) return path;
  if (/^(data:|blob:|https?:\/\/)/i.test(path)) return path;

  // 去掉所有前导斜杠，避免 //images/... 被浏览器当成域名
  const clean = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${clean}`;
}
