type ThemeCssCacheEntry = {
  css: string;
  createdAt: number;
};

type ThemeCssCacheBackend = {
  get(hash: string): Promise<string | undefined> | string | undefined;
  set(hash: string, css: string): Promise<void> | void;
  clear?: () => Promise<void> | void;
};

const MAX_LOCAL_ENTRIES = 32;
const localCache = new Map<string, ThemeCssCacheEntry>();

let externalBackend: ThemeCssCacheBackend | null = null;

function touchLocalEntry(hash: string, entry: ThemeCssCacheEntry): void {
  localCache.delete(hash);
  localCache.set(hash, entry);
}

function evictIfNeeded(): void {
  if (localCache.size <= MAX_LOCAL_ENTRIES) {
    return;
  }

  const oldestKey = localCache.keys().next().value;
  if (oldestKey) {
    localCache.delete(oldestKey);
  }
}

export function registerThemeCssCacheBackend(
  backend: ThemeCssCacheBackend | null
): void {
  externalBackend = backend;
}

export async function getThemeCssFromCache(
  hash: string
): Promise<string | undefined> {
  if (externalBackend) {
    const externalValue = await externalBackend.get(hash);
    if (externalValue) {
      return externalValue;
    }
  }

  const localEntry = localCache.get(hash);
  if (!localEntry) {
    return undefined;
  }

  touchLocalEntry(hash, localEntry);
  return localEntry.css;
}

export async function setThemeCssCache(
  hash: string,
  css: string
): Promise<void> {
  if (externalBackend) {
    await externalBackend.set(hash, css);
  }

  const entry: ThemeCssCacheEntry = {
    css,
    createdAt: Date.now(),
  };

  touchLocalEntry(hash, entry);
  evictIfNeeded();
}

export async function clearThemeCssCache(): Promise<void> {
  localCache.clear();
  if (externalBackend?.clear) {
    await externalBackend.clear();
  }
}
