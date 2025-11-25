import type { FoodItem, Badge } from "@shared/schema";

const STORAGE_KEYS = {
  foods: 'nutritrack_foods',
  dailyMeals: 'nutritrack_daily_meals',
  shoppingLists: 'nutritrack_shopping_lists',
  settings: 'nutritrack_settings',
  categories: 'nutritrack_categories',
  badges: 'nutritrack_badges',
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

// Meals Storage
export interface MealIngredient {
  foodId: string;
  grams: number;
  name?: string;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: MealIngredient[];
  isFavorite: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredientCount: number;
}

export function calculateMealNutrition(meal: Meal, foods: FoodItem[]): Meal {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  meal.ingredients.forEach(ing => {
    const food = foods.find(f => f.id === ing.foodId);
    if (food) {
      const multiplier = ing.grams / 100;
      totalCalories += food.calories * multiplier;
      totalProtein += food.protein * multiplier;
      totalCarbs += food.carbs * multiplier;
      totalFat += food.fat * multiplier;
    }
  });

  return {
    ...meal,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    ingredientCount: meal.ingredients.length,
  };
}

export function saveMeals(meals: Meal[]) {
  localStorage.setItem('nutritrack_meals', JSON.stringify(meals));
}

export function loadMeals(): Meal[] {
  const data = localStorage.getItem('nutritrack_meals');
  return data ? JSON.parse(data) : [];
}

// Weekly meal assignments (day of week -> meal id)
export interface WeeklyAssignment {
  dayOfWeek: number;
  mealId: string;
  mealName: string;
}

export function saveWeeklyAssignments(assignments: WeeklyAssignment[]) {
  localStorage.setItem('nutritrack_weekly_assignments', JSON.stringify(assignments));
}

export function loadWeeklyAssignments(): WeeklyAssignment[] {
  const data = localStorage.getItem('nutritrack_weekly_assignments');
  return data ? JSON.parse(data) : [];
}

export function assignMealToDay(dayOfWeek: number, mealId: string, mealName: string) {
  const assignments = loadWeeklyAssignments();
  const existing = assignments.findIndex(a => a.dayOfWeek === dayOfWeek);
  if (existing >= 0) {
    assignments[existing] = { dayOfWeek, mealId, mealName };
  } else {
    assignments.push({ dayOfWeek, mealId, mealName });
  }
  saveWeeklyAssignments(assignments);
}

export function removeMealFromDay(dayOfWeek: number) {
  const assignments = loadWeeklyAssignments();
  const filtered = assignments.filter(a => a.dayOfWeek !== dayOfWeek);
  saveWeeklyAssignments(filtered);
}

// Badge Storage
export function saveBadges(badges: Badge[]) {
  localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(badges));
}

export function loadBadges(): Badge[] {
  const data = localStorage.getItem(STORAGE_KEYS.badges);
  return data ? JSON.parse(data) : [];
}

export function unlockBadge(badgeId: string) {
  const badges = loadBadges();
  const badge = badges.find(b => b.id === badgeId);
  if (badge && !badge.unlocked) {
    badge.unlocked = true;
    badge.unlockedAt = new Date().toISOString();
    saveBadges(badges);
  }
}

// Helper function to calculate daily meal score
export function calculateDailyScore(dateKey: string, settings: Settings): string {
  const meals = getDailyMeal(dateKey);
  const totalCalories = meals.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = meals.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = meals.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = meals.reduce((sum, item) => sum + item.fat, 0);

  const calorieScore = totalCalories > 0 ? totalCalories / settings.calorieGoal : 0;
  const proteinScore = totalProtein > 0 ? totalProtein / settings.proteinGoal : 0;
  const carbsScore = totalCarbs > 0 ? totalCarbs / settings.carbsGoal : 0;
  const fatScore = totalFat > 0 ? totalFat / settings.fatGoal : 0;

  const avgScore = (calorieScore + proteinScore + carbsScore + fatScore) / 4;

  if (avgScore >= 0.95) return 'A+';
  if (avgScore >= 0.9) return 'A';
  if (avgScore >= 0.85) return 'A-';
  if (avgScore >= 0.8) return 'B+';
  if (avgScore >= 0.75) return 'B';
  if (avgScore >= 0.7) return 'B-';
  if (avgScore >= 0.6) return 'C+';
  if (avgScore >= 0.5) return 'C';
  if (avgScore >= 0.4) return 'C-';
  if (avgScore >= 0.2) return 'D';
  return 'F';
}

// Helper function to check 7 consecutive days
export function checkSevenConsecutiveDays(): boolean {
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const meals = getDailyMeal(dateKey);
    if (meals.length === 0) return false;
  }
  return true;
}

// Helper function to check water goal reached today
export function checkWaterGoalToday(settings: Settings): boolean {
  const today = new Date().toISOString().split('T')[0];
  const waterToday = getWaterIntake(today);
  return waterToday >= settings.waterTargetMl;
}

// Helper function to check all nutritional goals for 7 days
export function checkNutritionalGoalsSevenDays(settings: Settings): boolean {
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const meals = getDailyMeal(dateKey);
    
    if (meals.length === 0) return false;
    
    const totalCalories = meals.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = meals.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = meals.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = meals.reduce((sum, item) => sum + item.fat, 0);

    const calorieOk = totalCalories >= settings.calorieGoal * 0.9 && totalCalories <= settings.calorieGoal * 1.1;
    const proteinOk = totalProtein >= settings.proteinGoal * 0.9 && totalProtein <= settings.proteinGoal * 1.1;
    const carbsOk = totalCarbs >= settings.carbsGoal * 0.9 && totalCarbs <= settings.carbsGoal * 1.1;
    const fatOk = totalFat >= settings.fatGoal * 0.9 && totalFat <= settings.fatGoal * 1.1;

    if (!calorieOk || !proteinOk || !carbsOk || !fatOk) return false;
  }
  return true;
}

// Helper function to check perfect week (A+ for 7 days)
export function checkPerfectWeek(settings: Settings): boolean {
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const score = calculateDailyScore(dateKey, settings);
    if (score !== 'A+') return false;
  }
  return true;
}

// Export/Import all data
export function exportAllData() {
  // Collect all water intake data
  const waterIntake: { [key: string]: number } = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('nutritrack_water_')) {
      const date = key.replace('nutritrack_water_', '');
      const value = localStorage.getItem(key);
      if (value) {
        waterIntake[date] = parseInt(value);
      }
    }
  }

  return {
    foods: loadFoods(),
    dailyMeals: loadDailyMeals(),
    meals: loadMeals(),
    weeklyAssignments: loadWeeklyAssignments(),
    waterIntake: waterIntake,
    shoppingLists: loadShoppingLists(),
    settings: loadSettings(),
    categories: loadCategories(),
    badges: loadBadges(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAllData(data: any) {
  if (data.foods) saveFoods(data.foods);
  if (data.dailyMeals) saveDailyMeals(data.dailyMeals);
  if (data.meals) saveMeals(data.meals);
  if (data.weeklyAssignments) saveWeeklyAssignments(data.weeklyAssignments);
  if (data.waterIntake && typeof data.waterIntake === 'object') {
    Object.entries(data.waterIntake).forEach(([date, ml]) => {
      saveWaterIntake(date, ml as number);
    });
  }
  if (data.shoppingLists) saveShoppingLists(data.shoppingLists);
  if (data.settings) saveSettings(data.settings);
  if (data.categories) saveCategories(data.categories);
  if (data.badges) saveBadges(data.badges);
}

export function clearAllData() {
  // Remove all keys in STORAGE_KEYS
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  
  // Remove additional static keys
  localStorage.removeItem('nutritrack_meals');
  localStorage.removeItem('nutritrack_weekly_assignments');
  
  // Remove all dynamic water intake keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('nutritrack_water_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
