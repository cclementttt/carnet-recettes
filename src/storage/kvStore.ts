import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'carnet-recettes';
const STORE_NAME = 'kv';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGetItem(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSetItem(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbRemoveItem(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function migrateFromLocalStorage(): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const migrated = await idbGetItem('__migrated');
  if (migrated) return;

  const keys = ['recipes', 'categories', 'shoppingList'];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      await idbSetItem(key, value);
    }
  }
  await idbSetItem('__migrated', '1');
}

let migrationDone = false;

const webStore = {
  async getItem(key: string): Promise<string | null> {
    if (!migrationDone) {
      await migrateFromLocalStorage();
      migrationDone = true;
    }
    return idbGetItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!migrationDone) {
      await migrateFromLocalStorage();
      migrationDone = true;
    }
    return idbSetItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    return idbRemoveItem(key);
  },
};

const kvStore = Platform.OS === 'web' ? webStore : AsyncStorage;

export default kvStore;
