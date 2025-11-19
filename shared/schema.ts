import { z } from "zod";

// Food item schema
export const foodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  isFavorite: z.boolean().default(false),
});

export type FoodItem = z.infer<typeof foodItemSchema>;

// Meal ingredient schema
export const mealIngredientSchema = z.object({
  foodId: z.string(),
  grams: z.number(),
});

export type MealIngredient = z.infer<typeof mealIngredientSchema>;

// Meal schema
export const mealSchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(mealIngredientSchema),
  isFavorite: z.boolean().default(false),
});

export type Meal = z.infer<typeof mealSchema>;

// Diary entry schema
export const diaryEntrySchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  mealType: z.enum(["colazione", "pranzo", "cena", "spuntino"]),
  mealId: z.string().optional(),
  foodItems: z.array(mealIngredientSchema),
});

export type DiaryEntry = z.infer<typeof diaryEntrySchema>;

// Nutritional goals schema
export const nutritionalGoalsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
});

export type NutritionalGoals = z.infer<typeof nutritionalGoalsSchema>;

// Water tracking schema
export const waterTrackingSchema = z.object({
  date: z.string(), // ISO date string
  mlConsumed: z.number(),
  glasses: z.number(),
});

export type WaterTracking = z.infer<typeof waterTrackingSchema>;

// Settings schema
export const settingsSchema = z.object({
  itemsPerPage: z.number().default(8),
  waterTargetMl: z.number().default(2000),
  glassCapacityMl: z.number().default(200),
  waterReminderEnabled: z.boolean().default(false),
  waterReminderIntervalMinutes: z.number().default(120),
  waterReminderStartHour: z.number().default(8),
  waterReminderEndHour: z.number().default(20),
});

export type Settings = z.infer<typeof settingsSchema>;

// Shopping list schema
export const shoppingListSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    checked: z.boolean().default(false),
  })),
  isPredefined: z.boolean().default(false),
});

export type ShoppingList = z.infer<typeof shoppingListSchema>;

// Weekly calendar schema
export const weeklyCalendarSchema = z.object({
  dayOfWeek: z.number(), // 0-6 (Sunday-Saturday)
  mealId: z.string().optional(),
});

export type WeeklyCalendar = z.infer<typeof weeklyCalendarSchema>;

// Badge/achievement schema
export const badgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  unlocked: z.boolean().default(false),
  unlockedAt: z.string().optional(),
});

export type Badge = z.infer<typeof badgeSchema>;

// Meal score schema
export const mealScoreSchema = z.object({
  grade: z.enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]),
  explanation: z.string(),
});

export type MealScore = z.infer<typeof mealScoreSchema>;
