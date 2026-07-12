import { useEffect, useMemo, useState } from 'react';

type EvidenceViewerItem = {
  src: string;
  title: string;
};

function normalizeFileContentUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const [withoutHash = ''] = trimmed.split('#');
  const [clean = ''] = withoutHash.split('?');
  if (/\/api\/files\/[0-9a-f-]{36}\/content$/i.test(clean)) return trimmed;
  const match = clean.match(/^(.*\/api\/files\/[0-9a-f-]{36})\/?$/i);
  if (!match) return trimmed;
  return `${match[1]}/content`;
}

function isEvidenceImage(image: HTMLImageElement) {
  const src = image.getAttribute('src') ?? '';
  const normalized = normalizeFileContentUrl(src);
  return /\/api\/files\/[0-9a-f-]{36}\/content/i.test(normalized) || src.startsWith('blob:');
}

function normalizeEvidenceImages(scope: Document | Element = document) {
  const images = Array.from(scope.querySelectorAll<HTMLImageElement>('section[role="dialog"] img'));
  images.forEach((image) => {
    const current = image.getAttribute('src') ?? '';
    const normalized = normalizeFileContentUrl(current);
    if (normalized !== current) image.setAttribute('src', normalized);
    if (isEvidenceImage(image)) {
      image.style.cursor = 'pointer';
      image.dataset.evidenceViewerImage = 'true';
    }
  });
}

function titleFromImage(image: HTMLImageElement, index: number) {
  const alt = image.getAttribute('alt')?.trim();
  if (alt) return alt;
  const contentDispositionTitle = image.getAttribute('data-title')?.trim();
  if (contentDispositionTitle) return contentDispositionTitle;
  return `imagen-${index + 1}.jpg`;
}

function buildGallery(clickedImage: HTMLImageElement) {
  const dialog = clickedImage.closest('section[role="dialog"]') ?? document;
  const rawImages = Array.from(dialog.querySelectorAll('img')).filter((image): image is HTMLImageElement => image instanceof HTMLImageElement && isEvidenceImage(image));
  const unique = new Map<string, EvidenceViewerItem>();
  rawImages.forEach((image, index) => {
    const src = normalizeFileContentUrl(image.currentSrc || image.src || image.getAttribute('src') || '');
    if (!src) return;
    const key = `${src}|${titleFromImage(image, index)}`;
    if (!unique.has(key)) unique.set(key, { src, title: titleFromImage(image, index) });
  });
  const items = Array.from(unique.values());
  const clickedSrc = normalizeFileContentUrl(clickedImage.currentSrc || clickedImage.src || clickedImage.getAttribute('src') || '');
  const index = Math.max(0, items.findIndex((item) => item.src === clickedSrc));
  return { items, index };
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.6 1.6 14.4 14.4M14.4 1.6 1.6 14.4" stroke="#131313" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={direction === 'right' ? 'rotate-180' : ''}><path d="M10 3 5 8l5 5" stroke="#333333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function InspectionEvidenceViewerBridge() {
  const [items, setItems] = useState<EvidenceViewerItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? null;
  const total = items.length;
  const canNavigate = total > 1;

  useEffect(() => {
    normalizeEvidenceImages();
    const observer = new MutationObserver(() => normalizeEvidenceImages());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (target.closest('[data-evidence-viewer-dialog="true"]')) return;
      if (!target.closest('section[role="dialog"]')) return;
      normalizeEvidenceImages();
      if (!isEvidenceImage(target)) return;
      const gallery = buildGallery(target);
      if (gallery.items.length === 0) return;
      event.preventDefault();
      event.stopPropagation();
      setItems(gallery.items);
      setActiveIndex(gallery.index);
    }
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    if (!activeItem) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setItems([]);
        setActiveIndex(0);
      }
      if (event.key === 'ArrowLeft' && canNavigate) {
        setActiveIndex((current) => (current - 1 + total) % total);
      }
      if (event.key === 'ArrowRight' && canNavigate) {
        setActiveIndex((current) => (current + 1) % total);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, canNavigate, total]);

  const displayTitle = useMemo(() => activeItem?.title || 'imagen.jpg', [activeItem]);

  if (!activeItem) return null;

  const goPrevious = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current - 1 + total) % total);
  };
  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current + 1) % total);
  };
  const close = () => {
    setItems([]);
    setActiveIndex(0);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(19,19,19,0.75)] px-[32px] py-[16px]" role="presentation" onClick={close}>
      <div className="flex h-[min(704px,calc(100vh-32px))] w-[min(1132px,calc(100vw-64px))] flex-col overflow-hidden rounded-[24px] border border-[#d1d1d1] bg-white" role="dialog" aria-modal="true" aria-label="Visor de evidencia" data-evidence-viewer-dialog="true" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#e3e3e3] px-[15px]">
          <p className="truncate pr-[24px] text-[18px] font-bold leading-[22px] tracking-[0.36px] text-[#2a2a2a]">{displayTitle}</p>
          <button type="button" className="flex size-[32px] shrink-0 items-center justify-center" onClick={close} aria-label="Cerrar visor"><CloseIcon /></button>
        </div>
        <div className="mx-[15px] mt-[15px] flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          <img src={activeItem.src} alt={displayTitle} className="h-full max-h-full w-full max-w-full object-contain" />
        </div>
        <div className="mx-[15px] mb-[5px] flex h-[48px] shrink-0 items-center justify-between border-y border-[#d1d1d1] px-[16px]">
          <button type="button" className="flex size-[32px] items-center justify-center rounded-[8px] disabled:opacity-35" onClick={goPrevious} disabled={!canNavigate} aria-label="Imagen anterior"><ArrowIcon direction="left" /></button>
          <p className="text-center text-[14px] font-normal leading-[22px] tracking-[0.28px] text-[#131313]">{activeIndex + 1}/{total}</p>
          <button type="button" className="flex size-[32px] items-center justify-center rounded-[8px] disabled:opacity-35" onClick={goNext} disabled={!canNavigate} aria-label="Imagen siguiente"><ArrowIcon direction="right" /></button>
        </div>
      </div>
    </div>
  );
}
