
export const safeStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};

const _get = <T>(key: string): T | null => {
  const value = safeStorage.getItem(key);
  try {
    return value ? (JSON.parse(value) as T) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return value as T;
  }
};

const _set = <T>(key: string, value: T): void => {
  safeStorage.setItem(key, JSON.stringify(value));
};

export const storage = {
  setItem: <T>(key: string, value: T) => {
    _set(key, value);
  },

  getItem: <T>(key: string): T | null => _get<T>(key),

  removeItem: (key: string) => {
    safeStorage.removeItem(key);
  },

  clear: () => {
    safeStorage.clear();
  },

  // getUserInfo() {
  //   return _get<{ state: { user: User } }>(KEY_STORAGE.USER_INFO);
  // },
};
