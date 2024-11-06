//New2- creating a costum hook to access the store
import { useContext } from 'react';
import { RootStoreContext } from '../RootStore';

export const useStore = () => useContext(RootStoreContext);
