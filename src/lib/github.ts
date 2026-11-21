/**
 * GitHub 仓储读写
 * ---------------------------------------------------------------------------
 * 后台把作品直接写回仓库，提交后 GitHub Pages 自动重新构建。
 * 一次发布 = 一个 commit（图片和内容一起提交），不会产生一串零碎提交。
 */

export interface RepoRef {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface FileChange {
  path: string;
  /** 文本内容 */
  text?: string;
  /** base64 内容（图片） */
  base64?: string;
  /** 设为 true 表示删除该文件 */
  remove?: boolean;
}

const API = 'https://api.github.com';

class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function gh<T>(
  path: string,
  ref: Pick<RepoRef, 'token'>,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${ref.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ?? `请求失败（${res.status}）`;
    if (res.status === 401) throw new GitHubError('令牌无效或已过期', 401);
    if (res.status === 403)
      throw new GitHubError('没有权限：令牌需要有该仓库的 Contents 读写权限', 403);
    if (res.status === 404)
      throw new GitHubError('找不到仓库或文件，检查仓库名和令牌权限', 404);
    if (res.status === 409) throw new GitHubError('仓库是空的，请先手动提交一次', 409);
    throw new GitHubError(msg, res.status);
  }

  return body as T;
}

/** 从页面地址推测仓库，如 https://user.github.io/archive/ → user/archive */
export function guessRepo(): { owner: string; repo: string } {
  const host = location.hostname;
  const parts = location.pathname.split('/').filter(Boolean);
  if (host.endsWith('.github.io')) {
    return { owner: host.replace('.github.io', ''), repo: parts[0] ?? '' };
  }
  return { owner: '', repo: '' };
}

export async function verifyRepo(ref: RepoRef): Promise<void> {
  const repo = await gh<{ default_branch: string; permissions?: { push?: boolean } }>(
    `/repos/${ref.owner}/${ref.repo}`,
    ref,
  );
  if (repo.permissions && repo.permissions.push === false) {
    throw new GitHubError('这个令牌没有写入权限', 403);
  }
  ref.branch = repo.default_branch || 'main';
}

export async function readFile(
  ref: RepoRef,
  path: string,
): Promise<{ text: string; sha: string } | null> {
  try {
    const file = await gh<{ content: string; sha: string; encoding: string }>(
      `/repos/${ref.owner}/${ref.repo}/contents/${encodeURI(path)}?ref=${ref.branch}`,
      ref,
    );
    const bin = atob(file.content.replace(/\n/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return { text: new TextDecoder().decode(bytes), sha: file.sha };
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

export async function listDir(ref: RepoRef, path: string): Promise<string[]> {
  try {
    const items = await gh<{ name: string; type: string }[]>(
      `/repos/${ref.owner}/${ref.repo}/contents/${encodeURI(path)}?ref=${ref.branch}`,
      ref,
    );
    return items.filter((i) => i.type === 'file').map((i) => i.name);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return [];
    throw e;
  }
}

/**
 * 把一组文件改动合并成一个 commit。
 * 用 Git Data API 而不是 Contents API，避免一张图一个 commit。
 */
export async function commitChanges(
  ref: RepoRef,
  changes: FileChange[],
  message: string,
): Promise<string> {
  const head = await gh<{ object: { sha: string } }>(
    `/repos/${ref.owner}/${ref.repo}/git/ref/heads/${ref.branch}`,
    ref,
  );
  const parentSha = head.object.sha;
  const parent = await gh<{ tree: { sha: string } }>(
    `/repos/${ref.owner}/${ref.repo}/git/commits/${parentSha}`,
    ref,
  );

  const tree: Record<string, unknown>[] = [];
  for (const change of changes) {
    if (change.remove) {
      tree.push({
        path: change.path,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
      continue;
    }
    const blob = await gh<{ sha: string }>(
      `/repos/${ref.owner}/${ref.repo}/git/blobs`,
      ref,
      {
        method: 'POST',
        body: JSON.stringify({
          content: change.base64 ?? btoa(unescape(encodeURIComponent(change.text ?? ''))),
          encoding: 'base64',
        }),
      },
    );
    tree.push({
      path: change.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  const newTree = await gh<{ sha: string }>(
    `/repos/${ref.owner}/${ref.repo}/git/trees`,
    ref,
    {
      method: 'POST',
      body: JSON.stringify({ tree, base_tree: parent.tree.sha }),
    },
  );

  const commit = await gh<{ sha: string }>(
    `/repos/${ref.owner}/${ref.repo}/git/commits`,
    ref,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: newTree.sha,
        parents: [parentSha],
      }),
    },
  );

  await gh(`/repos/${ref.owner}/${ref.repo}/git/refs/heads/${ref.branch}`, ref, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
}

/** 把图片压到适合网页的尺寸，返回 JPEG base64 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82,
): Promise<{ base64: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('浏览器不支持图片处理');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { base64: dataUrl.split(',')[1], width, height };
}
