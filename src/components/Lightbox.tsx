import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProjectImage } from '../types';
import Plate from './Plate';
import '../styles/lightbox.css';

interface Props {
  images: ProjectImage[];
  startIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const total = images.length;

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [go, onClose]);

  const image = images[index];

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label="图片浏览">
      <div className="lb__bar">
        <span className="lb__count num">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button ref={closeRef} type="button" className="lb__close" onClick={onClose}>
          关闭
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div
        className="lb__stage"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 44) go(dx > 0 ? -1 : 1);
          touchX.current = null;
        }}
      >
        <button
          type="button"
          className="lb__nav lb__nav--prev"
          onClick={() => go(-1)}
          aria-label="上一张"
        >
          <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden="true">
            <path d="M26 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        <figure className="lb__figure">
          <Plate
            key={image.id}
            data={image.plate}
            src={image.src}
            alt={image.alt}
            ratio={image.ratio}
            seed={image.id}
            eager
          />
          <figcaption className="lb__caption">{image.caption}</figcaption>
        </figure>

        <button
          type="button"
          className="lb__nav lb__nav--next"
          onClick={() => go(1)}
          aria-label="下一张"
        >
          <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden="true">
            <path d="M0 5h24M20 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
