import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ArchiveContent, Project, ProjectImage } from '../types';
import {
  commitChanges,
  compressImage,
  guessRepo,
  readFile,
  verifyRepo,
  type FileChange,
  type RepoRef,
} from '../lib/github';
import { usePageMeta } from '../hooks/useSite';
import { validateArchive } from '../content/validate.mjs';
import '../styles/admin.css';

const CONTENT_PATH = 'src/content/archive.json';
const SESSION_KEY = 'archive.admin.session';
const RATIOS = ['portrait', 'landscape', 'square', 'wide', 'tall'] as const;

const RATIO_LABEL: Record<string, string> = {
  portrait: '竖版 4:5',
  landscape: '横版 3:2',
  square: '方形 1:1',
  wide: '宽幅 16:9',
  tall: '长条 2:3',
};

type Mode = 'list' | 'edit' | 'site';

interface Draft extends Project {
  /** 尚未提交的图片：路径 → base64 */
  pending: Record<string, { base64: string; preview: string }>;
}

function loadSession(): RepoRef | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RepoRef;
    return s.token && s.owner && s.repo ? s : null;
  } catch {
    return null;
  }
}

function slugId(base: string, taken: Set<string>): string {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  let id = clean || 'work';
  if (/[\u4e00-\u9fa5]/.test(id)) id = `work-${Date.now().toString(36)}`;
  let n = 2;
  const original = id;
  while (taken.has(id)) id = `${original}-${n++}`;
  return id;
}

function emptyProject(archive: ArchiveContent): Project {
  const year = new Date().getFullYear();
  const taken = new Set(archive.projects.map((p) => p.id));
  const firstCat = archive.categories[0];
  const seq = String(archive.projects.length + 1).padStart(2, '0');
  // 编号前缀取自分类英文名的首字母：Digital Products → DP
  const initials = (firstCat?.nameEn ?? '').match(/\b[A-Z]/g)?.join('') ?? '';
  return {
    id: slugId(`work-${year}-${seq}`, taken),
    code: `${initials || firstCat?.index || '01'}·${year}·${seq}`,
    title: '',
    titleEn: '',
    category: firstCat?.id ?? 'digital-products',
    year,
    order: Math.max(0, ...archive.projects.map((p) => p.order)) + 10,
    featured: false,
    summary: '',
    description: '',
    cover: {
      id: 'cover',
      alt: '',
      caption: '',
      ratio: 'portrait',
      plate: { motif: 'stack', tone: 'paper' },
    },
    gallery: [],
    tags: [],
    background: '',
    designConcept: '',
    features: [{ title: '', body: '' }],
    process: [{ title: '', body: '' }],
    technology: [],
  };
}

/* ---------------------------------------------------------------------------
   小组件
   --------------------------------------------------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {hint ? <span className="field__hint">{hint}</span> : null}
      {children}
    </label>
  );
}

function ImageSlot({
  image,
  pending,
  onChange,
  onClear,
  onRatio,
}: {
  image: ProjectImage;
  pending?: { preview: string };
  onChange: (file: File) => void;
  onClear: () => void;
  onRatio: (ratio: ProjectImage['ratio']) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const preview = pending?.preview ?? image.src;

  return (
    <div className="slot">
      <button
        type="button"
        className="slot__frame"
        onClick={() => input.current?.click()}
        aria-label={image.src ? '更换图片' : '上传图片'}
      >
        {preview ? (
          <img src={preview} alt="" />
        ) : (
          <span className="slot__empty">
            <span className="slot__plus">＋</span>
            选择图片
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = '';
        }}
      />
      <div className="slot__meta">
        <select
          className="input input--tiny"
          value={image.ratio}
          onChange={(e) => onRatio(e.target.value as ProjectImage['ratio'])}
          aria-label="图片比例"
        >
          {RATIOS.map((r) => (
            <option key={r} value={r}>
              {RATIO_LABEL[r]}
            </option>
          ))}
        </select>
        {preview ? (
          <button type="button" className="slot__clear" onClick={onClear}>
            移除
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   页面
   --------------------------------------------------------------------------- */

export default function Admin() {
  usePageMeta('管理 · 个人数字档案馆');

  const [session, setSession] = useState<RepoRef | null>(loadSession);
  const [archive, setArchive] = useState<ArchiveContent | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [owner, setOwner] = useState(() => loadSession()?.owner ?? guessRepo().owner);
  const [repo, setRepo] = useState(() => loadSession()?.repo ?? guessRepo().repo);
  const [token, setToken] = useState(() => loadSession()?.token ?? '');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  const say = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 6000);
  };

  const load = useCallback(async (ref: RepoRef) => {
    setBusy('读取内容…');
    try {
      const file = await readFile(ref, CONTENT_PATH);
      if (!file) throw new Error(`仓库里找不到 ${CONTENT_PATH}`);
      setArchive(JSON.parse(file.text) as ArchiveContent);
    } catch (e) {
      say('err', e instanceof Error ? e.message : String(e));
      setSession(null);
    } finally {
      setBusy('');
    }
  }, []);

  useEffect(() => {
    if (session) void load(session);
  }, [session, load]);

  const connect = async () => {
    const ref: RepoRef = { owner: owner.trim(), repo: repo.trim(), token: token.trim(), branch: 'main' };
    if (!ref.owner || !ref.repo || !ref.token) {
      say('err', '三个都要填');
      return;
    }
    setBusy('验证令牌…');
    try {
      await verifyRepo(ref);
      localStorage.setItem(SESSION_KEY, JSON.stringify(ref));
      setSession(ref);
      say('ok', '已连接');
    } catch (e) {
      say('err', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };

  const disconnect = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setArchive(null);
    setMode('list');
  };

  const publish = async (next: ArchiveContent, changes: FileChange[], message: string) => {
    if (!session) return;

    // 发布前先校验，避免把坏数据提交上去导致线上构建失败
    const issues = validateArchive(next);
    if (issues.length > 0) {
      const shown = issues.slice(0, 3).join('；');
      say(
        'err',
        `还有 ${issues.length} 处没填好：${shown}${issues.length > 3 ? ' 等' : ''}`,
      );
      return;
    }

    setBusy('正在发布…');
    try {
      const all: FileChange[] = [
        { path: CONTENT_PATH, text: JSON.stringify(next, null, 2) + '\n' },
        ...changes,
      ];
      await commitChanges(session, all, message);
      setArchive(next);
      say('ok', '已发布 · 约 1 分钟后线上生效');
      setMode('list');
      setDraft(null);
    } catch (e) {
      say('err', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };

  /* ---- 编辑作品 ---- */

  const startNew = () => {
    if (!archive) return;
    const p = emptyProject(archive);
    setDraft({ ...p, pending: {} });
    setMode('edit');
  };

  const startEdit = (p: Project) => {
    setDraft({ ...structuredClone(p), pending: {} });
    setMode('edit');
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const pickImage = async (target: 'cover' | number, file: File) => {
    if (!draft) return;
    setBusy('处理图片…');
    try {
      const { base64 } = await compressImage(file);
      const key = target === 'cover' ? 'cover' : `g${target + 1}`;
      const path = `public/images/${draft.id}/${key}.jpg`;
      const preview = `data:image/jpeg;base64,${base64}`;
      setDraft((d) => {
        if (!d) return d;
        const pending = { ...d.pending, [path]: { base64, preview } };
        if (target === 'cover') {
          return {
            ...d,
            pending,
            cover: { ...d.cover, src: `/${path.replace(/^public/, '')}` },
          };
        }
        const gallery = [...d.gallery];
        gallery[target] = {
          ...gallery[target],
          src: `/${path.replace(/^public/, '')}`,
        };
        return { ...d, pending, gallery };
      });
    } catch (e) {
      say('err', '图片处理失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy('');
    }
  };

  const addGallery = () => {
    if (!draft) return;
    const index = draft.gallery.length;
    setDraft({
      ...draft,
      gallery: [
        ...draft.gallery,
        {
          id: `g${index + 1}`,
          alt: '',
          caption: '',
          ratio: 'landscape',
          plate: { motif: 'lines', tone: 'paper' },
        },
      ],
    });
  };

  const saveDraft = async () => {
    if (!archive || !draft) return;
    if (!draft.title.trim()) {
      say('err', '先填作品名');
      return;
    }
    const { pending, ...project } = draft;
    const clean: Project = {
      ...project,
      cover: { ...project.cover, alt: project.cover.alt || project.title },
      gallery: project.gallery.map((g, i) => ({
        ...g,
        alt: g.alt || `${project.title} 图 ${i + 1}`,
      })),
      features: project.features.filter((f) => f.title.trim() || f.body.trim()),
      process: project.process.filter((f) => f.title.trim() || f.body.trim()),
    };

    const exists = archive.projects.some((p) => p.id === clean.id);
    const next: ArchiveContent = {
      ...archive,
      projects: exists
        ? archive.projects.map((p) => (p.id === clean.id ? clean : p))
        : [...archive.projects, clean],
    };

    const changes: FileChange[] = Object.entries(pending).map(([path, v]) => ({
      path,
      base64: v.base64,
    }));

    await publish(
      next,
      changes,
      `${exists ? '更新' : '新增'}作品：${clean.title}`,
    );
  };

  const removeProject = async (p: Project) => {
    if (!archive) return;
    if (!window.confirm(`删除《${p.title}》？这条记录会从档案里移除，图片文件会保留。`)) return;
    const next = { ...archive, projects: archive.projects.filter((x) => x.id !== p.id) };
    await publish(next, [], `删除作品：${p.title}`);
  };

  const saveSite = async (patch: Partial<ArchiveContent['site']>) => {
    if (!archive) return;
    const next = { ...archive, site: { ...archive.site, ...patch } };
    await publish(next, [], '更新站点信息');
  };

  /* ---- 渲染 ---- */

  if (!session || !archive) {
    return (
      <div className="page admin">
        <div className="shell shell--narrow">
          <header className="admin__head">
            <span className="meta">管理</span>
            <h1 className="admin__title">连接仓库</h1>
            <p className="admin__lede">
              后台直接往你的 GitHub 仓库写内容，提交后自动上线。令牌只存在这台设备的浏览器里。
            </p>
          </header>

          <div className="admin__panel">
            <Field label="GitHub 用户名">
              <input
                className="input"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="yourname"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </Field>
            <Field label="仓库名">
              <input
                className="input"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="archive"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </Field>
            <Field
              label="访问令牌"
              hint="Fine-grained 或 Classic 都行，只要有该仓库的 Contents 读写权限"
            >
              <input
                className="input"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
                autoCapitalize="off"
                autoCorrect="off"
              />
            </Field>

            <div className="admin__actions">
              <button type="button" className="btn" onClick={connect} disabled={!!busy}>
                {busy || '连接'}
              </button>
              <a
                className="admin__hint-link"
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer noopener"
              >
                创建令牌 ↗
              </a>
            </div>

            <ol className="admin__steps">
              <li>打开上面的链接，Token name 随便填</li>
              <li>Repository access 选 Only select repositories，选你的仓库</li>
              <li>Permissions → Contents 选 Read and write</li>
              <li>Generate token，复制，粘贴到上面</li>
            </ol>
            <p className="admin__note">
              已经有 Classic token（勾了 repo 权限）也可以直接粘贴，不必新建。
            </p>
          </div>

          {toast ? <p className={`toast toast--${toast.kind}`}>{toast.text}</p> : null}
        </div>
      </div>
    );
  }

  if (mode === 'edit' && draft) {
    return (
      <div className="page admin">
        <div className="shell shell--narrow">
          <header className="admin__bar">
            <button type="button" className="admin__back" onClick={() => setMode('list')}>
              ← 返回
            </button>
            <span className="meta">{draft.title || '新作品'}</span>
          </header>

          <h1 className="admin__title">{draft.title ? '编辑作品' : '新建作品'}</h1>

          <section className="admin__group">
            <h2>基本信息</h2>
            <Field label="作品名">
              <input
                className="input"
                value={draft.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="静读"
              />
            </Field>
            <div className="admin__row">
              <Field label="分类">
                <select
                  className="input"
                  value={draft.category}
                  onChange={(e) => setField('category', e.target.value)}
                >
                  {archive.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.index} · {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="年份">
                <input
                  className="input"
                  type="number"
                  value={draft.year}
                  onChange={(e) => setField('year', Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="档案编号" hint="显示在卡片上，如 DP·2024·01">
              <input
                className="input"
                value={draft.code}
                onChange={(e) => setField('code', e.target.value)}
              />
            </Field>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setField('featured', e.target.checked)}
              />
              放到首页精选
            </label>
          </section>

          <section className="admin__group">
            <h2>封面与图版</h2>
            <ImageSlot
              image={draft.cover}
              pending={draft.pending[`public/images/${draft.id}/cover.jpg`]}
              onChange={(f) => void pickImage('cover', f)}
              onClear={() => setField('cover', { ...draft.cover, src: undefined })}
              onRatio={(r) => setField('cover', { ...draft.cover, ratio: r })}
            />
            <div className="admin__gallery">
              {draft.gallery.map((g, i) => (
                <div key={g.id}>
                  <ImageSlot
                    image={g}
                    pending={draft.pending[`public/images/${draft.id}/g${i + 1}.jpg`]}
                    onChange={(f) => void pickImage(i, f)}
                    onClear={() => {
                      const next = draft.gallery.filter((_, j) => j !== i);
                      setField('gallery', next);
                    }}
                    onRatio={(r) => {
                      const next = [...draft.gallery];
                      next[i] = { ...next[i], ratio: r };
                      setField('gallery', next);
                    }}
                  />
                  <input
                    className="input input--tiny"
                    value={g.caption ?? ''}
                    placeholder="图注（可留空）"
                    onChange={(e) => {
                      const next = [...draft.gallery];
                      next[i] = { ...next[i], caption: e.target.value };
                      setField('gallery', next);
                    }}
                  />
                </div>
              ))}
              <button type="button" className="slot slot--add" onClick={addGallery}>
                <span className="slot__plus">＋</span>
                <span>加一张</span>
              </button>
            </div>
            <p className="admin__note">
              没有上传图片时，会自动用排版图版占位，不会出现空白块。
            </p>
          </section>

          <section className="admin__group">
            <h2>文字</h2>
            <Field label="一句话简介" hint="列表里显示">
              <textarea
                className="input"
                rows={2}
                value={draft.summary}
                onChange={(e) => setField('summary', e.target.value)}
              />
            </Field>
            <Field label="项目简介" hint="详情页标题下">
              <textarea
                className="input"
                rows={3}
                value={draft.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </Field>
            <Field label="创作背景与目的">
              <textarea
                className="input"
                rows={4}
                value={draft.background}
                onChange={(e) => setField('background', e.target.value)}
              />
            </Field>
            <Field label="核心设计理念">
              <textarea
                className="input"
                rows={4}
                value={draft.designConcept}
                onChange={(e) => setField('designConcept', e.target.value)}
              />
            </Field>

            <PairList
              label="功能与内容"
              items={draft.features}
              onChange={(v) => setField('features', v)}
            />
            <PairList
              label="创作过程"
              items={draft.process}
              onChange={(v) => setField('process', v)}
            />
          </section>

          <section className="admin__group">
            <h2>技术与链接</h2>
            <Field label="标签" hint="用逗号分隔">
              <input
                className="input"
                value={draft.tags.join('，')}
                onChange={(e) =>
                  setField(
                    'tags',
                    e.target.value
                      .split(/[,，]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="工具，排版"
              />
            </Field>
            <Field label="技术" hint="用逗号分隔">
              <input
                className="input"
                value={draft.technology.join('，')}
                onChange={(e) =>
                  setField(
                    'technology',
                    e.target.value
                      .split(/[,，]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="React，TypeScript"
              />
            </Field>
            <Field label="在线访问地址" hint="可留空，留空显示「暂未公开」">
              <input
                className="input"
                value={draft.projectUrl ?? ''}
                onChange={(e) => setField('projectUrl', e.target.value)}
                placeholder="https://..."
                autoCapitalize="off"
              />
            </Field>
          </section>

          <div className="admin__sticky">
            <button type="button" className="btn" onClick={saveDraft} disabled={!!busy}>
              {busy || '发布'}
            </button>
            <button type="button" className="admin__cancel" onClick={() => setMode('list')}>
              取消
            </button>
          </div>

          {toast ? <p className={`toast toast--${toast.kind}`}>{toast.text}</p> : null}
        </div>
      </div>
    );
  }

  if (mode === 'site') {
    return (
      <SiteEditor
        archive={archive}
        busy={busy}
        onBack={() => setMode('list')}
        onSave={saveSite}
        toast={toast}
      />
    );
  }

  return (
    <div className="page admin">
      <div className="shell shell--narrow">
        <header className="admin__bar">
          <span className="meta meta--plain">
            {session.owner}/{session.repo}
          </span>
          <button type="button" className="admin__back" onClick={disconnect}>
            退出
          </button>
        </header>

        <h1 className="admin__title">作品管理</h1>
        <p className="admin__lede">
          共 {archive.projects.length} 件作品。发布后约 1 分钟线上生效。
        </p>

        <div className="admin__toolbar">
          <button type="button" className="btn" onClick={startNew}>
            ＋ 新建作品
          </button>
          <button type="button" className="admin__ghost" onClick={() => setMode('site')}>
            站点信息
          </button>
        </div>

        <ul className="admin__list">
          {[...archive.projects]
            .sort((a, b) => b.order - a.order)
            .map((p) => (
              <li key={p.id} className="admin__item">
                <button type="button" className="admin__item-main" onClick={() => startEdit(p)}>
                  <span className="admin__item-code">{p.code}</span>
                  <span className="admin__item-title">
                    {p.title}
                    {p.featured ? <span className="admin__star">精选</span> : null}
                  </span>
                  <span className="admin__item-meta">
                    {archive.categories.find((c) => c.id === p.category)?.name} · {p.year}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin__item-del"
                  onClick={() => void removeProject(p)}
                  aria-label={`删除 ${p.title}`}
                >
                  删除
                </button>
              </li>
            ))}
        </ul>

        {archive.projects.length === 0 ? (
          <p className="admin__note">还没有作品，点上面的「新建作品」开始。</p>
        ) : null}

        {toast ? <p className={`toast toast--${toast.kind}`}>{toast.text}</p> : null}

        <p className="admin__foot">
          <Link to="/">← 回到网站</Link>
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   重复字段组
   --------------------------------------------------------------------------- */

function PairList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { title: string; body: string }[];
  onChange: (v: { title: string; body: string }[]) => void;
}) {
  return (
    <div className="pairs">
      <span className="field__label">{label}</span>
      {items.map((item, i) => (
        <div className="pairs__row" key={i}>
          <input
            className="input"
            value={item.title}
            placeholder="小标题"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className="input"
            rows={2}
            value={item.body}
            placeholder="说明"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], body: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            className="pairs__del"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="删除这一条"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pairs__add"
        onClick={() => onChange([...items, { title: '', body: '' }])}
      >
        ＋ 加一条
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   站点信息
   --------------------------------------------------------------------------- */

function SiteEditor({
  archive,
  busy,
  onBack,
  onSave,
  toast,
}: {
  archive: ArchiveContent;
  busy: string;
  onBack: () => void;
  onSave: (patch: Partial<ArchiveContent['site']>) => void;
  toast: { kind: 'ok' | 'err'; text: string } | null;
}) {
  const [form, setForm] = useState(archive.site);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="page admin">
      <div className="shell shell--narrow">
        <header className="admin__bar">
          <button type="button" className="admin__back" onClick={onBack}>
            ← 返回
          </button>
          <span className="meta">站点</span>
        </header>

        <h1 className="admin__title">站点信息</h1>

        <section className="admin__group">
          <Field label="名字">
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="英文名">
            <input
              className="input"
              value={form.nameEn}
              onChange={(e) => set('nameEn', e.target.value)}
            />
          </Field>
          <Field label="首屏简介">
            <textarea
              className="input"
              rows={3}
              value={form.lede}
              onChange={(e) => set('lede', e.target.value)}
            />
          </Field>
          <Field label="邮箱">
            <input
              className="input"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoCapitalize="off"
            />
          </Field>
          <Field label="正在做">
            <textarea
              className="input"
              rows={2}
              value={form.now}
              onChange={(e) => set('now', e.target.value)}
            />
          </Field>
        </section>

        <div className="admin__sticky">
          <button type="button" className="btn" onClick={() => onSave(form)} disabled={!!busy}>
            {busy || '保存'}
          </button>
          <button type="button" className="admin__cancel" onClick={onBack}>
            取消
          </button>
        </div>

        {toast ? <p className={`toast toast--${toast.kind}`}>{toast.text}</p> : null}
      </div>
    </div>
  );
}
