// NEW: Import from Zustand store
import { useAppStore } from "@/context/AppStore";
import type { FoodItem, Badge } from "@shared/schema";
import type {
  DailyMealItem,
  DailyMeal,
  HealthData,
  MealIngredient,
  Meal,
  WeeklyAssignment,
  ShoppingList,
  Settings,
} from "@/context/types";
import { defaultAppData } from "@/context/types";

// Re-export types for backward compatibility
export type {
  DailyMealItem,
  DailyMeal,
  HealthData,
  MealIngredient,
  Meal,
  WeeklyAssignment,
  ShoppingList,
  Settings,
};

// ==================== WRAPPER FUNCTIONS ====================
// These functions wrap the Zustand store to maintain backward compatibility

// Foods Storage
export function saveFoods(foods: FoodItem[]) {
  useAppStore.setState({ foods });
  // Save to localStorage immediately
  useAppStore.getState().saveState();
}

export function loadFoods(): FoodItem[] {
  return useAppStore.getState().foods;
}

// Daily Meals Storage
export function saveDailyMeals(meals: DailyMeal[]) {
  useAppStore.setState({ dailyMeals: meals });
}

export function loadDailyMeals(): DailyMeal[] {
  return useAppStore.getState().dailyMeals;
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
  const state = useAppStore.getState();
  const updated = { ...state.waterIntake, [date]: ml };
  useAppStore.setState({ waterIntake: updated });
}

export function getWaterIntake(date: string): number {
  const waterIntake = useAppStore.getState().waterIntake;
  return waterIntake[date] || 0;
}

// Health Data Storage
export function saveHealthData(date: string, health: Partial<HealthData>) {
  const state = useAppStore.getState();
  const existing = state.healthData[date] || { date };
  const updated = { ...state.healthData, [date]: { ...existing, ...health, date } };
  useAppStore.setState({ healthData: updated });
}

export function getHealthData(date: string): HealthData {
  const healthData = useAppStore.getState().healthData;
  return healthData[date] || { date };
}

export function getAllHealthData(): HealthData[] {
  const healthData = useAppStore.getState().healthData;
  return Object.values(healthData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Shopping Lists Storage
export function saveShoppingLists(lists: ShoppingList[]) {
  useAppStore.setState({ shoppingLists: lists });
}

export function loadShoppingLists(): ShoppingList[] {
  return useAppStore.getState().shoppingLists;
}

// Settings Storage
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
  useAppStore.setState({ settings });
}

export function loadSettings(): Settings {
  return useAppStore.getState().settings;
}

// Categories Storage
export function saveCategories(categories: string[]) {
  useAppStore.setState({ categories });
}

export function loadCategories(): string[] {
  return useAppStore.getState().categories;
}

// Meals Storage
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
  useAppStore.setState({ meals });
}

export function loadMeals(): Meal[] {
  return useAppStore.getState().meals;
}

// Weekly meal assignments
export function saveWeeklyAssignments(assignments: WeeklyAssignment[]) {
  useAppStore.setState({ weeklyAssignments: assignments });
}

export function loadWeeklyAssignments(): WeeklyAssignment[] {
  return useAppStore.getState().weeklyAssignments;
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
  useAppStore.setState({ badges });
}

export function loadBadges(): Badge[] {
  return useAppStore.getState().badges;
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

// Badge check functions
export function checkFirstMealLogged(): boolean {
  const today = new Date().toISOString().split('T')[0];
  const meals = getDailyMeal(today);
  return meals.length > 0;
}

export function checkMealCreator(): boolean {
  const meals = loadMeals();
  return meals.length > 0;
}

export function checkFirstFavorite(): boolean {
  const foods = loadFoods();
  return foods.some(f => f.isFavorite);
}

export function checkScannerPro(): boolean {
  // Check if any food has barcode-like id (9-15 digits or EAN format)
  const foods = loadFoods();
  return foods.some(f => /^\d{8,15}$/.test(f.id));
}

export function checkListSpecialist(): boolean {
  const lists = loadShoppingLists();
  return lists.length > 0;
}

export function checkHydrationMarathoner(settings: Settings): boolean {
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const waterToday = getWaterIntake(dateKey);
    if (waterToday < settings.waterTargetMl) return false;
  }
  return true;
}

export function checkProPlanner(): boolean {
  const meals = loadMeals();
  return meals.length >= 10;
}

export function checkFavoriteCollector(): boolean {
  const foods = loadFoods();
  const favorites = foods.filter(f => f.isFavorite);
  return favorites.length >= 25;
}

export function checkThirtyConsecutiveDays(): boolean {
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const meals = getDailyMeal(dateKey);
    if (meals.length === 0) return false;
  }
  return true;
}

export function checkHydrationMonarch(settings: Settings): boolean {
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const waterToday = getWaterIntake(dateKey);
    if (waterToday < settings.waterTargetMl) return false;
  }
  return true;
}

export function checkSupremeChef(): boolean {
  const meals = loadMeals();
  return meals.length >= 50;
}

export function checkGuruOfFavorites(): boolean {
  const foods = loadFoods();
  const favorites = foods.filter(f => f.isFavorite);
  return favorites.length >= 100;
}

export function checkLegendOfPerseverance(): boolean {
  const today = new Date();
  for (let i = 99; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const meals = getDailyMeal(dateKey);
    if (meals.length === 0) return false;
  }
  return true;
}

// CSV Export/Import for Foods
export function exportFoodsAsCSV(): string {
  const foods = loadFoods();
  
  const header = 'id,serving_size_g,calories,protein,carbohydrates,fat,fiber,sugar,sodium,name_category';
  
  const rows = foods.map(food => {
    const serving_size_g = 100;
    const calories = food.calories;
    const protein = food.protein;
    const carbohydrates = food.carbs;
    const fat = food.fat;
    const fiber = food.fiber || 0;
    const sugar = food.sugar || 0;
    const sodium = food.sodium || 0;
    
    const name_category = `"it=${food.name}:${food.category || 'Senza categoria'};en=${food.name}:${food.category || 'Uncategorized'}"`;
    
    return `${food.id},${serving_size_g},${calories},${protein},${carbohydrates},${fat},${fiber},${sugar},${sodium},${name_category}`;
  });
  
  return [header, ...rows].join('\n');
}

// CSV Parser - handles quoted fields correctly
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  fields.push(current.trim());
  return fields;
}

// CSV Import for Foods
export function importFoodsFromCSV(csv: string): FoodItem[] {
  const lines = csv.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const foods: FoodItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines
    
    const fields = parseCSVLine(line);

    try {
      if (fields.length < 10) {
        continue;
      }

      const id = fields[0];
      const calories = parseFloat(fields[2]);
      const protein = parseFloat(fields[3]);
      const carbohydrates = parseFloat(fields[4]);
      const fat = parseFloat(fields[5]);
      const fiber = parseFloat(fields[6]) || 0;
      const sugar = parseFloat(fields[7]) || 0;
      const sodium = parseFloat(fields[8]) || 0;

      let name_category = fields[9];
      // Remove quotes if present
      if (name_category.startsWith('"') && name_category.endsWith('"')) {
        name_category = name_category.slice(1, -1);
      }

      let name = 'Unknown';
      let category = 'Senza categoria';

      if (name_category) {
        const parts = name_category.split(';');
        for (const part of parts) {
          if (part.startsWith('it=')) {
            const [n, c] = part.slice(3).split(':');
            name = n || name;
            category = c || category;
          }
          if (part.startsWith('en=')) {
            const [n, c] = part.slice(3).split(':');
            if (name === 'Unknown') name = n || name;
            if (category === 'Senza categoria') category = c || category;
          }
        }
      }

      const food: FoodItem = {
        id,
        name,
        category,
        calories,
        protein,
        carbs: carbohydrates,
        fat,
        fiber,
        sugar,
        sodium,
        isFavorite: false,
        gramsPerServing: 100,
      };

      foods.push(food);
    } catch (error) {
      // Skip rows with parsing errors
    }
  }

  if (foods.length === 0) {
    throw new Error('No valid foods found in CSV file');
  }

  return foods;
}

// Data Export/Import
export async function exportData(): Promise<string> {
  const state = useAppStore.getState();
  const data = {
    foods: state.foods,
    dailyMeals: state.dailyMeals,
    meals: state.meals,
    weeklyAssignments: state.weeklyAssignments,
    shoppingLists: state.shoppingLists,
    settings: state.settings,
    categories: state.categories,
    badges: state.badges,
    healthData: state.healthData,
    waterIntake: state.waterIntake,
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string | ProgressEvent<FileReader>) {
  let jsonString: string;
  
  // Handle FileReader result
  if (json instanceof ProgressEvent || (json && typeof json === 'object' && 'target' in json)) {
    const event = json as ProgressEvent<FileReader>;
    jsonString = event.target?.result as string || '';
  } else {
    jsonString = json as string;
  }
  
  const data = JSON.parse(jsonString);
  
  if (data.foods) saveFoods(data.foods);
  if (data.dailyMeals) saveDailyMeals(data.dailyMeals);
  if (data.meals) saveMeals(data.meals);
  if (data.weeklyAssignments) saveWeeklyAssignments(data.weeklyAssignments);
  if (data.shoppingLists) saveShoppingLists(data.shoppingLists);
  if (data.settings) saveSettings(data.settings);
  if (data.categories) saveCategories(data.categories);
  if (data.badges) saveBadges(data.badges);
  if (data.healthData) useAppStore.setState({ healthData: data.healthData });
  if (data.waterIntake) useAppStore.setState({ waterIntake: data.waterIntake });
}

// ==================== PROMPTED STATE (Session Tracking) ====================
// These functions manage temporary state for prompts shown to the user
// Using localStorage internally but accessed through this indirection layer
// In future, this can be replaced with a different adapter

const PROMPTED_AUTO_MEAL_COPY_PREFIX = 'nutritrack_meal_auto_copy_prompt_';

/**
 * Check if user has already been prompted for auto-meal copy on a specific date
 * @param dateKey - Format: yyyy-MM-dd
 * @returns true if already prompted, false otherwise
 */
export function isAutoMealCopyPrompted(dateKey: string): boolean {
  const promptedKey = `${PROMPTED_AUTO_MEAL_COPY_PREFIX}${dateKey}`;
  return localStorage.getItem(promptedKey) === 'true';
}

/**
 * Mark that user has been prompted for auto-meal copy on a specific date
 * @param dateKey - Format: yyyy-MM-dd
 */
export function markAutoMealCopyPrompted(dateKey: string): void {
  const promptedKey = `${PROMPTED_AUTO_MEAL_COPY_PREFIX}${dateKey}`;
  localStorage.setItem(promptedKey, 'true');
}

/**
 * Clear all prompted state (useful for testing or resetting)
 */
export function clearPromptedState(): void {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PROMPTED_AUTO_MEAL_COPY_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
}

// Clear All Data
export function clearAllData() {
  useAppStore.setState({
    foods: [],
    dailyMeals: [],
    meals: [],
    weeklyAssignments: [],
    shoppingLists: [],
    settings: defaultSettings,
    categories: defaultAppData.categories,
    badges: [],
    healthData: {},
    waterIntake: {},
  });
  // Also clear prompted state
  clearPromptedState();
  // Force save to localStorage immediately
  useAppStore.getState().saveState();
}

// App initialization - load stored state
export async function initializeApp() {
  const store = useAppStore.getState();
  await store.loadState();
}

// Backward compatibility aliases
export const exportAllData = exportData;
export const importAllData = importData;
