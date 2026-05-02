import { useEffect } from 'react';
import { useAppStore } from '../../hooks/useAppStore';

export const FlashBanner = () => {
  const {
    state: { flashMessage },
    store,
  } = useAppStore();

  useEffect(() => {
    if (!flashMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      store.dismissFlash();
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [flashMessage, store]);

  if (!flashMessage) {
    return null;
  }

  return (
    <div className={`flash-banner flash-banner--${flashMessage.tone}`}>
      <span>{flashMessage.text}</span>
      <button type="button" onClick={() => store.dismissFlash()}>
        Dismiss
      </button>
    </div>
  );
};
