import { createContext } from 'react';
import { AppStore } from '../../application/store/AppStore';

export const AppStoreContext = createContext<AppStore | null>(null);
