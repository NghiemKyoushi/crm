
import { storage } from '../storage';

export const restoreStorage = (backup: Record<string, string | null>) => {
  Object.entries(backup).forEach(([key, value]) => {
    if (value !== null) {
      storage.setItem(key, value);
    }
  });
};
