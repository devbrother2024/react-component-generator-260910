import { useEffect } from 'react';
import { saveToStorage } from '../utils/storage';

export function usePersistToStorage<T>(key: string, value: T): void {
  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);
}
