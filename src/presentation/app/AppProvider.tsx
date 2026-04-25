import { type ReactNode, useState } from 'react';
import { AppStore } from '../../application/store/AppStore';
import { createAppStoreDependencies } from '../../infrastructure/createAppStoreDependencies';
import { AppStoreContext } from './AppStoreContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [store] = useState(() => new AppStore(createAppStoreDependencies()));

  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  );
};
