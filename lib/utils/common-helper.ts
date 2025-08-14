
import { KEEP_KEYS_STORAGE } from '@/constants/storage';
import { storage } from '../storage';

export const backUpStorage = () => {
  const backup: Record<string, string | null> = {};
  KEEP_KEYS_STORAGE.forEach((key) => {
    backup[key] = storage.getItem(key);
  });
  return backup;
};

export const restoreStorage = (backup: Record<string, string | null>) => {
  Object.entries(backup).forEach(([key, value]) => {
    if (value !== null) {
      storage.setItem(key, value);
    }
  });
};
