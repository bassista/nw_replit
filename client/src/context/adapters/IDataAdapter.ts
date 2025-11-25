import type { AppData } from "../types";

export interface IDataAdapter {
  /**
   * Save the entire app state
   */
  save(data: AppData): Promise<void>;

  /**
   * Load the entire app state
   */
  load(): Promise<AppData>;
}
