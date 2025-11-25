import type { FoodItem } from "@shared/schema";

const STORAGE_KEYS = {
  foods: 'nutritrack_foods',
  dailyMeals: 'nutritrack_daily_meals',
  shoppingLists: 'nutritrack_shopping_lists',
  settings: 'nutritrack_settings',
  categories: 'nutritrack_categories',
} as const;

// Foods Storage
export function saveFoods(foods: FoodItem[]) {
  localStorage.setItem(STORAGE_KEYS.foods, JSON.stringify(foods));
}

export function loadFoods(): FoodItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.foods);
  return data ? JSON.parse(data) : [];
}

// Daily Meals Storage
export interface DailyMealItem {
  id: string;
  foodId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
}

export interface DailyMeal {
  date: string;
  items: DailyMealItem[];
}

export function saveDailyMeals(meals: DailyMeal[]) {
  localStorage.setItem(STORAGE_KEYS.dailyMeals, JSON.stringify(meals));
}

export function loadDailyMeals(): DailyMeal[] {
  const data = localStorage.getItem(STORAGE_KEYS.dailyMeals);
  return data ? JSON.parse(data) : [];
}

export function saveDailyMeal(date: string, items: DailyMeal['items']) {
  const meals = loadDailyMeals();
  const index = meals.findIndex(m => m.date === date);
  if (index >= 0) {
    meals[index].items = items;
  } else {
    meals.push({ date, items });
  }
  saveDailyMeals(meals);
}

export function getDailyMeal(date: string): DailyMeal['items'] {
  const meals = loadDailyMeals();
  return meals.find(m => m.date === date)?.items || [];
}

// Water Intake Storage
export function saveWaterIntake(date: string, ml: number) {
  const waterKey = `nutritrack_water_${date}`;
  localStorage.setItem(waterKey, ml.toString());
}

export function getWaterIntake(date: string): number {
  const waterKey = `nutritrack_water_${date}`;
  const data = localStorage.getItem(waterKey);
  return data ? parseInt(data) : 0;
}

// Shopping Lists Storage
export interface ShoppingList {
  id: string;
  name: string;
  items: Array<{ id: string; name: string; checked: boolean }>;
  isPredefined: boolean;
}

export function saveShoppingLists(lists: ShoppingList[]) {
  localStorage.setItem(STORAGE_KEYS.shoppingLists, JSON.stringify(lists));
}

export function loadShoppingLists(): ShoppingList[] {
  const data = localStorage.getItem(STORAGE_KEYS.shoppingLists);
  return data ? JSON.parse(data) : [];
}

// Settings Storage
export interface Settings {
  itemsPerPage: number;
  waterTargetMl: number;
  glassCapacityMl: number;
  waterReminderEnabled: boolean;
  waterReminderIntervalMinutes: number;
  waterReminderStartHour: number;
  waterReminderEndHour: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export const defaultSettings: Settings = {
  itemsPerPage: 8,
  waterTargetMl: 2000,
  glassCapacityMl: 200,
  waterReminderEnabled: false,
  waterReminderIntervalMinutes: 120,
  waterReminderStartHour: 8,
  waterReminderEndHour: 20,
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 250,
  fatGoal: 65,
};

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function loadSettings(): Settings {
  const data = localStorage.getItem(STORAGE_KEYS.settings);
  return data ? JSON.parse(data) : defaultSettings;
}

// Categories Storage
export function saveCategories(categories: string[]) {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

export function loadCategories(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.categories);
  return data ? JSON.parse(data) : ['Carboidrati', 'Frutta', 'Latticini', 'Proteine', 'Verdure'];
}

// Export/Import all data
export function exportAllData() {
  return {
    foods: loadFoods(),
    dailyMeals: loadDailyMeals(),
    shoppingLists: loadShoppingLists(),
    settings: loadSettings(),
    categories: loadCategories(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAllData(data: any) {
  if (data.foods) saveFoods(data.foods);
  if (data.dailyMeals) saveDailyMeals(data.dailyMeals);
  if (data.shoppingLists) saveShoppingLists(data.shoppingLists);
  if (data.settings) saveSettings(data.settings);
  if (data.categories) saveCategories(data.categories);
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
