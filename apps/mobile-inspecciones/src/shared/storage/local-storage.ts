export interface LocalStorageDriver {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(prefix?: string): Promise<string[]>;
  clear(prefix?: string): Promise<void>;
}

class MemoryLocalStorageDriver implements LocalStorageDriver {
  private readonly values = new Map<string, string>();

  async get<T>(key: string): Promise<T | null> {
    const value = this.values.get(key);
    return value ? JSON.parse(value) as T : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.values.set(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }

  async keys(prefix = ''): Promise<string[]> {
    return [...this.values.keys()].filter((key) => key.startsWith(prefix));
  }

  async clear(prefix = ''): Promise<void> {
    const keys = await this.keys(prefix);
    keys.forEach((key) => this.values.delete(key));
  }
}

class BrowserLocalStorageDriver implements LocalStorageDriver {
  constructor(private readonly namespace: string) {}

  async get<T>(key: string): Promise<T | null> {
    const value = globalThis.localStorage?.getItem(this.toKey(key));
    return value ? JSON.parse(value) as T : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    globalThis.localStorage?.setItem(this.toKey(key), JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(this.toKey(key));
  }

  async keys(prefix = ''): Promise<string[]> {
    const storage = globalThis.localStorage;
    if (!storage) return [];
    const keys: string[] = [];
    const fullPrefix = this.toKey(prefix);
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(fullPrefix)) keys.push(key.replace(`${this.namespace}:`, ''));
    }
    return keys;
  }

  async clear(prefix = ''): Promise<void> {
    const keys = await this.keys(prefix);
    keys.forEach((key) => globalThis.localStorage?.removeItem(this.toKey(key)));
  }

  private toKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}

function canUseBrowserStorage(): boolean {
  try {
    return typeof globalThis.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export const localStorageDriver: LocalStorageDriver = canUseBrowserStorage()
  ? new BrowserLocalStorageDriver('aurelia-mobile-inspecciones')
  : new MemoryLocalStorageDriver();
