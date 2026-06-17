// src/app/lib/cache.js

function cloneDeep(val) {
  if (val === null || val === undefined) return val;
  if (val instanceof Date) return new Date(val.getTime());
  if (Array.isArray(val)) {
    return val.map(cloneDeep);
  }
  if (typeof val === "object") {
    const cloned = {};
    for (const key of Object.keys(val)) {
      cloned[key] = cloneDeep(val[key]);
    }
    return cloned;
  }
  return val;
}

class InMemoryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cloneDeep(entry.value);
  }

  set(key, value, ttlInSeconds) {
    const expiry = ttlInSeconds ? Date.now() + ttlInSeconds * 1000 : null;
    this.cache.set(key, {
      value: cloneDeep(value),
      expiry,
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  delPattern(pattern) {
    // Escape regex characters except '*'
    const regexStr = "^" + pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&").replace(/\*/g, ".*") + "$";
    const regex = new RegExp(regexStr);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new InMemoryCache();
