import { IStorage } from "./storage.types.js";
import { getPgStorage } from "./storage-pg.js";

// Lazy-load storage to avoid circular dependency issues during module evaluation
let storageInstance: IStorage | undefined;

export function getStorage(): IStorage {
  if (!storageInstance) {
    console.log("[Storage] Initializing storage instance...");
    storageInstance = getPgStorage();
    console.log("[Storage] Storage instance initialized.");
  }
  return storageInstance;
}

export const storage = getStorage();
export { type IStorage };
