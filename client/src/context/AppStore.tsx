import { create } from "zustand";
import type { AppData } from "./types";
import { defaultAppData } from "./types";
import type { IDataAdapter } from "./adapters/IDataAdapter";
import { LocalStorageAdapter } from "./adapters/LocalStorageAdapter";

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

interface AppStoreState extends AppData {
  // Actions
  setFoods: (foods: AppData["foods"]) => void;
  setDailyMeals: (meals: AppData["dailyMeals"]) => void;
  setMeals: (meals: AppData["meals"]) => void;
  setWeeklyAssignments: (assignments: AppData["weeklyAssignments"]) => void;
  setShoppingLists: (lists: AppData["shoppingLists"]) => void;
  setSettings: (settings: AppData["settings"]) => void;
  setCategories: (categories: string[]) => void;
  setBadges: (badges: AppData["badges"]) => void;
  setHealthData: (healthData: AppData["healthData"]) => void;
  setWaterIntake: (waterIntake: AppData["waterIntake"]) => void;

  // Utility methods
  loadState: () => Promise<void>;
  saveState: () => Promise<void>;
}

// Global adapter instance
const adapter: IDataAdapter = new LocalStorageAdapter();

// Debounced save function (500ms delay)
const debouncedSave = debounce(async (data: AppData) => {
  await adapter.save(data);
}, 500);

export const useAppStore = create<AppStoreState>((set, get) => ({
  ...defaultAppData,

  // Actions with debounced saves
  setFoods: (foods) => {
    set({ foods });
    const state = get();
    debouncedSave({
      ...state,
      foods,
    });
  },

  setDailyMeals: (dailyMeals) => {
    set({ dailyMeals });
    const state = get();
    debouncedSave({
      ...state,
      dailyMeals,
    });
  },

  setMeals: (meals) => {
    set({ meals });
    const state = get();
    debouncedSave({
      ...state,
      meals,
    });
  },

  setWeeklyAssignments: (weeklyAssignments) => {
    set({ weeklyAssignments });
    const state = get();
    debouncedSave({
      ...state,
      weeklyAssignments,
    });
  },

  setShoppingLists: (shoppingLists) => {
    set({ shoppingLists });
    const state = get();
    debouncedSave({
      ...state,
      shoppingLists,
    });
  },

  setSettings: (settings) => {
    set({ settings });
    const state = get();
    debouncedSave({
      ...state,
      settings,
    });
  },

  setCategories: (categories) => {
    set({ categories });
    const state = get();
    debouncedSave({
      ...state,
      categories,
    });
  },

  setBadges: (badges) => {
    set({ badges });
    const state = get();
    debouncedSave({
      ...state,
      badges,
    });
  },

  setHealthData: (healthData) => {
    set({ healthData });
    const state = get();
    debouncedSave({
      ...state,
      healthData,
    });
  },

  setWaterIntake: (waterIntake) => {
    set({ waterIntake });
    const state = get();
    debouncedSave({
      ...state,
      waterIntake,
    });
  },

  // Load entire state from adapter
  loadState: async () => {
    const data = await adapter.load();
    set(data);
  },

  // Save entire state to adapter (immediate, no debounce)
  saveState: async () => {
    const state = get();
    await adapter.save(state as AppData);
  },
}));

// Export adapter for easy switching in the future
export function setDataAdapter(newAdapter: IDataAdapter) {
  // In a real app, you might want to reload the state with the new adapter
  console.log("Data adapter switched. Note: Reload the app to load data from new adapter.");
}
