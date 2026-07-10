import { useEffect } from 'react';

export function ApproveCloseConfirmBridge() {
  useEffect(() => {
    const originalConfirm = window.confirm;
    window.confirm = (message?: string) => {
      if (message === '¿Aprobar cierre de esta observación?') return true;
      return originalConfirm.call(window, message);
    };
    return () => {
      window.confirm = originalConfirm;
    };
  }, []);

  return null;
}
