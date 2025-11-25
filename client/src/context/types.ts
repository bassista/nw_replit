import type { FoodItem, Badge } from "@shared/schema";

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

export interface HealthData {
  date: string;
  weight?: number;
  glucose?: number;
  insulin?: number;
}

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

export interface WeeklyAssignment {
  dayOfWeek: number;
  mealId: string;
  mealName: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: Array<{ id: string; name: string; checked: boolean }>;
  isPredefined: boolean;
}

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

export interface AppData {
  foods: FoodItem[];
  dailyMeals: DailyMeal[];
  meals: Meal[];
  weeklyAssignments: WeeklyAssignment[];
  shoppingLists: ShoppingList[];
  settings: Settings;
  categories: string[];
  badges: Badge[];
  healthData: Record<string, HealthData>; // date -> HealthData
  waterIntake: Record<string, number>; // date -> ml
}

export const defaultAppData: AppData = {
  foods: [],
  dailyMeals: [],
  meals: [],
  weeklyAssignments: [],
  shoppingLists: [],
  settings: {
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
  },
  categories: ['Carboidrati', 'Frutta', 'Latticini', 'Proteine', 'Verdure'],
  badges: [],
  healthData: {},
  waterIntake: {},
};
