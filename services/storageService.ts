
import { MistakeRecord, UserStats } from "../types";

const DB_NAME = "MistakeNotebookDB";
const STORE_NAME = "mistakes";
const STATS_STORE = "user_stats";
const DB_VERSION = 2; // 升级版本

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Failed to open IndexedDB");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        db.createObjectStore(STATS_STORE, { keyPath: "id" });
      }
    };
  });
};

export const saveMistakes = async (mistakes: MistakeRecord[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    mistakes.forEach(m => store.put(m));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Failed to save mistakes");
  });
};

export const getAllMistakes = async (): Promise<MistakeRecord[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as MistakeRecord[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject("Failed to get mistakes");
  });
};

export const deleteMistakeFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    transaction.oncomplete = () => resolve();
  });
};

export const getUserStats = async (): Promise<UserStats> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STATS_STORE, "readonly");
    const store = transaction.objectStore(STATS_STORE);
    const request = store.get("current_user");
    request.onsuccess = () => {
      const defaultStats: UserStats = {
        xp: 0,
        level: 1,
        streak: 0,
        lastActive: Date.now(),
        totalMistakes: 0,
        reviewedCount: 0,
        achievements: []
      };
      resolve(request.result || defaultStats);
    };
  });
};

export const saveUserStats = async (stats: UserStats): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STATS_STORE, "readwrite");
    const store = transaction.objectStore(STATS_STORE);
    store.put({ ...stats, id: "current_user" });
    transaction.oncomplete = () => resolve();
  });
};
