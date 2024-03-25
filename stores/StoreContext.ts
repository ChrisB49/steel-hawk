import React from 'react';
import { RootStore } from './RootStore';

export const StoreContext = React.createContext<RootStore | null>(null);