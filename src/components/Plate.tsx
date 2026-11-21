import type { ReactNode } from 'react';
import type { ImageRatio, Plate as PlateData, PlateTone } from '../types';
import '../styles/plate.css';

/**
 * 图版
 * ---------------------------------------------------------------------------
 * 作品还没有真实截图时，用一套受控的排版母题为它绘制封面：
 * 同一个母题 + 不同色调 + 由档案编号决定的随机种子 = 稳定且不重复的图版。
 * 一旦 cover.src / gallery[].src 填入真实图片，图版会自动让位。
 */

const TONES: Record<
  PlateTone,
  { bg: string; fg: string; soft: string; accent: string }
> = {
  paper: {
    bg: 'var(--paper-2)',
    fg: 'var(--ink)',
    soft: 'var(--ink-3)',
    accent: 'var(--brick)',
  },
  ink: {
    bg: 'var(--ink)',
    fg: 'var(--paper)',
    soft: 'rgba(244,240,230,0.42)',
    accent: 'var(--brick)',
  },
  brick: {
    bg: 'var(--brick)',
    fg: 'var(--paper)',
    soft: 'rgba(244,240,230,0.5)',
    accent: 'var(--ink)',
  },
  navy: {
    bg: 'var(--navy)',
    fg: 'var(--paper)',
    soft: 'rgba(244,240,230,0.42)',
    accent: 'var(--brick)',
  },
  olive: {
    bg: 'var(--olive)',
    fg: 'var(--paper)',
    soft: 'rgba(244,240,230,0.45)',
    accent: 'var(--paper)',
  },
};

const VIEWBOX: Record<ImageRatio, [number, number]> = {
  portrait: [100, 125],
  landscape: [150, 100],
  square: [100, 100],
  wide: [180, 100],
  tall: [100, 150],
};

function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

interface DrawArgs {
  w: number;
  h: number;
  r: () => number;
  c: (typeof TONES)['paper'];
  density: number;
  glyph: string;
}

function drawMotif(motif: PlateData['motif'], a: DrawArgs) {
  const { w, h, r, c, density, glyph } = a;
  const out: ReactNode[] = [];

  switch (motif) {
    case 'stack': {
      let x = w * 0.04;
      let i = 0;
      while (x < w * 0.96) {
        const bw = 2.4 + r() * 6.2;
        const accent = r() > 0.88;
        const top = h * (0.05 + r() * 0.05);
        const bottom = h * (0.14 + r() * 0.04);
        out.push(
          <rect
            key={`s${i}`}
            x={x}
            y={top}
            width={bw}
            height={h - top - bottom}
            fill={accent ? c.accent : c.fg}
            opacity={accent ? 0.9 : 0.1 + r() * 0.42}
          />,
        );
        // 书脊上的标签条，制造印刷品的层次
        if (bw > 4.4 && r() > 0.45) {
          const ly = h * (0.26 + r() * 0.34);
          out.push(
            <rect
              key={`sl${i}`}
              x={x}
              y={ly}
              width={bw}
              height={1.2}
              fill={accent ? c.bg : c.accent}
              opacity={0.7}
            />,
          );
        }
        x += bw + 0.9 + r() * 1.7;
        i += 1;
      }
      out.push(
        <rect
          key="shelf"
          x={w * 0.04}
          y={h * 0.86}
          width={w * 0.92}
          height={0.5}
          fill={c.fg}
          opacity={0.4}
        />,
      );
      break;
    }

    case 'lines': {
      let y = h * 0.16;
      let i = 0;
      while (y < h * 0.84) {
        const accent = r() > 0.93;
        out.push(
          <rect
            key={`l${i}`}
            x={w * 0.08}
            y={y}
            width={w * (0.34 + r() * 0.54)}
            height={0.5 + r() * 1.5}
            fill={accent ? c.accent : c.fg}
            opacity={accent ? 0.85 : 0.16 + r() * 0.55}
          />,
        );
        y += 3.2 + r() * 2.6;
        i += 1;
      }
      break;
    }

    case 'grid': {
      const cols = density > 12 ? 5 : 4;
      const rows = Math.max(3, Math.round((cols * h) / w));
      const pad = w * 0.08;
      const cw = (w - pad * 2) / cols;
      const ch = (h - pad * 2) / rows;
      const accentCol = Math.floor(r() * cols);
      const accentRow = Math.floor(r() * rows);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const on = r();
          const isAccent = x === accentCol && y === accentRow;
          if (!isAccent && on < 0.34) continue;
          out.push(
            <rect
              key={`g${x}-${y}`}
              x={pad + x * cw + 0.7}
              y={pad + y * ch + 0.7}
              width={cw - 1.4}
              height={ch - 1.4}
              fill={isAccent ? c.accent : c.fg}
              opacity={isAccent ? 0.92 : 0.08 + r() * 0.34}
            />,
          );
        }
      }
      break;
    }

    case 'arcs': {
      const cx = w * 0.5;
      const cy = h * 0.88;
      const maxR = Math.min(w, h) * 0.92;
      const n = 7 + Math.round(density / 3);
      for (let i = 1; i <= n; i += 1) {
        out.push(
          <circle
            key={`a${i}`}
            cx={cx}
            cy={cy}
            r={(maxR * i) / n}
            fill="none"
            stroke={i === n ? c.accent : c.fg}
            strokeWidth={i === n ? 1.6 : 0.55 + (i % 3) * 0.5}
            opacity={i === n ? 0.9 : 0.14 + (i / n) * 0.42}
          />,
        );
      }
      out.push(
        <circle
          key="core"
          cx={cx}
          cy={cy}
          r={maxR * 0.075}
          fill={c.accent}
          opacity={0.95}
        />,
      );
      break;
    }

    case 'letter': {
      out.push(
        <text
          key="glyph"
          x={w * 0.5}
          y={h * 0.52}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontSize={h * 0.82}
          letterSpacing="-0.05em"
          fill={c.fg}
        >
          {glyph}
        </text>,
      );
      out.push(
        <rect
          key="bar"
          x={w * 0.08}
          y={h * 0.84}
          width={w * 0.24}
          height={1.2}
          fill={c.accent}
        />,
      );
      break;
    }

    case 'bars': {
      const n = Math.max(10, density);
      const step = (w * 0.92) / n;
      const accent = Math.floor(r() * n);
      for (let i = 0; i < n; i += 1) {
        const bh = h * (0.1 + r() * 0.66);
        out.push(
          <rect
            key={`b${i}`}
            x={w * 0.04 + i * step + step * 0.18}
            y={h * 0.88 - bh}
            width={step * 0.62}
            height={bh}
            fill={i === accent ? c.accent : c.fg}
            opacity={i === accent ? 0.95 : 0.2 + r() * 0.45}
          />,
        );
      }
      out.push(
        <rect
          key="base"
          x={w * 0.04}
          y={h * 0.88}
          width={w * 0.92}
          height={0.5}
          fill={c.fg}
          opacity={0.4}
        />,
      );
      break;
    }

    case 'orbit':
    default: {
      const n = Math.max(8, density);
      const pad = w * 0.1;
      const pts = Array.from({ length: n }, () => ({
        x: pad + r() * (w - pad * 2),
        y: pad + r() * (h - pad * 2),
        r: 0.7 + r() * 1.8,
      }));
      const sorted = [...pts].sort((p, q) => p.x - q.x);
      for (let i = 0; i < sorted.length - 1; i += 1) {
        out.push(
          <line
            key={`ol${i}`}
            x1={sorted[i].x}
            y1={sorted[i].y}
            x2={sorted[i + 1].x}
            y2={sorted[i + 1].y}
            stroke={c.fg}
            strokeWidth={0.4}
            opacity={0.3}
          />,
        );
      }
      pts.forEach((p, i) => {
        out.push(
          <circle
            key={`oc${i}`}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? p.r * 2.4 : p.r}
            fill={i === 0 ? c.accent : c.fg}
            opacity={i === 0 ? 0.95 : 0.5}
          />,
        );
      });
      break;
    }
  }

  return out;
}

interface PlateProps {
  data?: PlateData;
  src?: string;
  alt: string;
  ratio?: ImageRatio;
  glyph?: string;
  label?: string;
  seed?: string;
  hover?: boolean;
  className?: string;
  eager?: boolean;
}

export default function Plate({
  data,
  src,
  alt,
  ratio = 'landscape',
  glyph = 'A',
  label,
  seed,
  hover = false,
  className = '',
  eager = false,
}: PlateProps) {
  const [w, h] = VIEWBOX[ratio];
  const motif = data?.motif ?? 'lines';
  const tone = TONES[data?.tone ?? 'paper'];
  const density = data?.density ?? 14;
  const rng = makeRng(`${seed ?? label ?? alt}-${motif}-${ratio}`);
  const marks = drawMotif(motif, {
    w,
    h,
    r: rng,
    c: tone,
    density,
    glyph,
  });

  return (
    <div
      className={`plate ratio--${ratio} ${hover ? 'plate-hover' : ''} ${className}`}
      style={{ background: tone.bg }}
    >
      <div className="plate__media">
        {src ? (
          <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        ) : (
          <svg
            viewBox={`0 0 ${w} ${h}`}
            role="img"
            aria-label={alt}
            preserveAspectRatio="xMidYMid slice"
          >
            {marks}
            {label ? (
              <text
                x={w * 0.055}
                y={h - w * 0.035}
                fontFamily="var(--font-sans)"
                fontSize={w * 0.026}
                letterSpacing={w * 0.004}
                fill={tone.fg}
                opacity={0.62}
              >
                {label}
              </text>
            ) : null}
          </svg>
        )}
      </div>
    </div>
  );
}
