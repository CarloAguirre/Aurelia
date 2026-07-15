import { useEffect, type ReactElement } from 'react';
import { downloadInspectionPdf } from '../../../shared/services/inspection-reports.service';

export function InspectionPdfDownloadBridge(): ReactElement | null {
  useEffect(() => {
    const originalOpen = window.open;
    const patchedOpen = ((url?: string | URL, target?: string, features?: string) => {
      const href = url ? String(url) : '';
      const match = href.match(/\/api\/inspections\/([^/]+)\/export\/pdf(?:\?.*)?$/);
      if (match?.[1]) {
        void downloadInspectionPdf(decodeURIComponent(match[1]));
        return null;
      }
      return originalOpen.call(window, url, target, features);
    }) as typeof window.open;

    window.open = patchedOpen;
    return () => {
      if (window.open === patchedOpen) window.open = originalOpen;
    };
  }, []);

  return null;
}
