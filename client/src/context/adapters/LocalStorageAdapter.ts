import type { IDataAdapter } from "./IDataAdapter";
import type { AppData } from "../types";
import { defaultAppData } from "../types";

const STORAGE_KEY = "nutritrack_app_state_v1";

export class LocalStorageAdapter implements IDataAdapter {
  async save(data: AppData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async load(): Promise<AppData> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultAppData;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse stored data:", error);
      return defaultAppData;
    }
  }
}
