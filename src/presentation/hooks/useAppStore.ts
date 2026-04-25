import { useContext, useSyncExternalStore } from 'react';
import { AppStoreContext } from '../app/AppStoreContext';

export const useAppStore = () => {
  const store = useContext(AppStoreContext);

  if (!store) {
    throw new Error('useAppStore must be used inside AppProvider.');
  }

  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store),
  );

  return {
    store,
    state,
  };
};
