import TopBar from "@/components/TopBar";
import StatisticsChart from "@/components/StatisticsChart";
import BadgeCard from "@/components/BadgeCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { 
  getDailyMeal, 
  loadSettings,
  loadBadges,
  saveBadges,
  checkSevenConsecutiveDays,
  checkWaterGoalToday,
  checkNutritionalGoalsSevenDays,
  checkPerfectWeek,
  checkFirstMealLogged,
  checkMealCreator,
  checkFirstFavorite,
  checkScannerPro,
  checkListSpecialist,
  checkHydrationMarathoner,
  checkProPlanner,
  checkFavoriteCollector,
  checkThirtyConsecutiveDays,
  checkHydrationMonarch,
  checkSupremeChef,
  checkGuruOfFavorites,
  checkLegendOfPerseverance,
  loadFoods,
  getWaterIntake,
  getHealthData,
  loadMeals,
  loadShoppingLists,
} from "@/lib/storage";
import type { Badge } from "@shared/schema";

export default function Stats() {
  const [activeTab, setActiveTab] = useState<"charts" | "badges">("charts");
  const [macroData, setMacroData] = useState<any[]>([]);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [hydrationData, setHydrationData] = useState<any[]>([]);
  const [weightCalorieData, setWeightCalorieData] = useState<any[]>([]);
  const [consistencyData, setConsistencyData] = useState<any[]>([]);
  const [topFoodsData, setTopFoodsData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [glucoseInsulinData, setGlucoseInsulinData] = useState<any[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [topFoodsMetric, setTopFoodsMetric] = useState<string>('frequenza');

  useEffect(() => {
    const today = new Date();
    const settings = loadSettings();
    const foods = loadFoods();

    // ===== CALORIE E MACRONUTRIENTI (7 giorni) =====
    const dailyCalories: any[] = [];
    const dailyMacros: { [key: string]: { protein: number; carbs: number; fat: number } } = {};

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: it }).slice(0, 3).toUpperCase();
      const mealItems = getDailyMeal(dateKey);
      const calories = mealItems.reduce((sum, item) => sum + item.calories, 0);
      const protein = mealItems.reduce((sum, item) => sum + item.protein, 0);
      const carbs = mealItems.reduce((sum, item) => sum + item.carbs, 0);
      const fat = mealItems.reduce((sum, item) => sum + item.fat, 0);

      dailyCalories.push({ 
        name: dayName, 
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
      });
      dailyMacros[dayName] = { protein, carbs, fat };
    }
    setCalorieData(dailyCalories);

    // ===== MACRO DISTRIBUTION (oggi) =====
    const todayKey = format(today, 'yyyy-MM-dd');
    const todayMeals = getDailyMeal(todayKey);
    const totalProtein = todayMeals.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = todayMeals.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = todayMeals.reduce((sum, item) => sum + item.fat, 0);
    
    const total = totalProtein + totalCarbs + totalFat;
    if (total > 0) {
      setMacroData([
        { name: 'Proteine', value: Math.round((totalProtein / total) * 100) },
        { name: 'Carboidrati', value: Math.round((totalCarbs / total) * 100) },
        { name: 'Grassi', value: Math.round((totalFat / total) * 100) },
      ]);
    } else {
      setMacroData([
        { name: 'Proteine', value: 0 },
        { name: 'Carboidrati', value: 0 },
        { name: 'Grassi', value: 0 },
      ]);
    }

    // ===== HYDRATION TREND (7 giorni) =====
    const hydrationTrend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: it }).slice(0, 3).toUpperCase();
      const water = getWaterIntake(dateKey);
      hydrationTrend.push({
        name: dayName,
        consumato: water,
        obiettivo: settings.waterTargetMl,
      });
    }
    setHydrationData(hydrationTrend);

    // ===== WEIGHT & CALORIE CORRELATION (7 giorni) =====
    const weightCalorieTrend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: it }).slice(0, 3).toUpperCase();
      const mealItems = getDailyMeal(dateKey);
      const calories = Math.round(mealItems.reduce((sum, item) => sum + item.calories, 0));
      const health = getHealthData(dateKey);
      const weight = health.weight || 0;
      weightCalorieTrend.push({
        name: dayName,
        calorie: calories,
        peso: weight,
      });
    }
    setWeightCalorieData(weightCalorieTrend);

    // ===== WEEKLY CONSISTENCY (score medio per giorno della settimana) =====
    const dayScores: { [key: number]: number[] } = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    // Calcola score per ultimi 30 giorni
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      const mealItems = getDailyMeal(dateKey);
      
      if (mealItems.length > 0) {
        // Calcola score semplice basato su calorie e macronutrienti
        const calories = mealItems.reduce((sum, item) => sum + item.calories, 0);
        const protein = mealItems.reduce((sum, item) => sum + item.protein, 0);
        const targetCalories = settings.calorieGoal;
        const calorieScore = Math.min(100, (calories / targetCalories) * 100);
        dayScores[dayOfWeek].push(calorieScore);
      }
    }

    const consistencyTrend = dayNames.map((name, idx) => {
      const scores = dayScores[idx];
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
      return { name, score: avgScore };
    });
    setConsistencyData(consistencyTrend);

    // ===== TOP 10 FOODS =====
    const foodFreq: { [key: string]: { name: string; count: number; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number } } = {};
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const mealItems = getDailyMeal(dateKey);
      mealItems.forEach(item => {
        const foodId = item.foodId;
        if (!foodFreq[foodId]) {
          foodFreq[foodId] = {
            name: item.name,
            count: 0,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
          };
        }
        foodFreq[foodId].count += 1;
        foodFreq[foodId].totalCalories += item.calories;
        foodFreq[foodId].totalProtein += item.protein;
        foodFreq[foodId].totalCarbs += item.carbs;
        foodFreq[foodId].totalFat += item.fat;
      });
    }
    const topFoods = Object.values(foodFreq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(food => ({
        nome: food.name,
        frequenza: food.count,
        calorie: Math.round(food.totalCalories),
        proteine: Math.round(food.totalProtein),
        carboidrati: Math.round(food.totalCarbs),
        grassi: Math.round(food.totalFat),
      }));
    setTopFoodsData(topFoods);

    // ===== CONSUMPTION BY CATEGORY =====
    const categoryCalories: { [key: string]: number } = {};
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const mealItems = getDailyMeal(dateKey);
      mealItems.forEach(item => {
        const food = foods.find(f => f.id === item.id);
        const category = food?.category || 'Altro';
        if (!categoryCalories[category]) categoryCalories[category] = 0;
        categoryCalories[category] += item.calories;
      });
    }
    const categoryPie = Object.entries(categoryCalories).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
    setCategoryData(categoryPie);

    // ===== GLUCOSE & INSULIN TRENDS (7 giorni) =====
    const glucoseInsulinTrend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: it }).slice(0, 3).toUpperCase();
      const health = getHealthData(dateKey);
      glucoseInsulinTrend.push({
        name: dayName,
        glucosio: health.glucose || 0,
        insulina: health.insulin || 0,
      });
    }
    setGlucoseInsulinData(glucoseInsulinTrend);

    // ===== BADGES =====
    const allBadges = [
      // Easy Tier
      { id: '5', name: 'First Meal Logged', description: 'Log any food or meal in the diary for the first time.', unlocked: false },
      { id: '6', name: 'Meal Creator', description: 'Create one custom meal.', unlocked: false },
      { id: '7', name: 'First Favorite', description: 'Mark one food as a favorite.', unlocked: false },
      { id: '8', name: 'Scanner Pro', description: 'Add a new food by scanning its barcode.', unlocked: false },
      { id: '9', name: 'List Specialist', description: 'Create one custom shopping list.', unlocked: false },
      // Medium Tier
      { id: '10', name: '7-Day Streak', description: 'Log at least one food or meal for 7 consecutive days.', unlocked: false },
      { id: '11', name: 'Hydration Marathoner', description: 'Meet the daily water intake goal for 7 consecutive days.', unlocked: false },
      { id: '12', name: 'Pro Planner', description: 'Create a total of 10 custom meals.', unlocked: false },
      { id: '13', name: 'Favorite Collector', description: 'Save 25 different foods to the favorites list.', unlocked: false },
      { id: '14', name: '30-Day Streak', description: 'Log at least one food or meal for 30 consecutive days.', unlocked: false },
      // Hard Tier
      { id: '15', name: 'Hydration Monarch', description: 'Meet the daily water intake goal for 30 consecutive days.', unlocked: false },
      { id: '16', name: 'Supreme Chef', description: 'Create a total of 50 custom meals.', unlocked: false },
      { id: '17', name: 'Guru of Favorites', description: 'Save 100 different foods in the favorites list.', unlocked: false },
      { id: '18', name: 'Legend of Perseverance', description: 'Log at least one food or meal for 100 consecutive days.', unlocked: false },
    ];

    let loadedBadges = loadBadges();
    if (loadedBadges.length === 0) {
      loadedBadges = allBadges;
      saveBadges(loadedBadges);
    } else {
      // Migrate old badges by adding missing new badges
      const existingIds = new Set(loadedBadges.map(b => b.id));
      const missingBadges = allBadges.filter(b => !existingIds.has(b.id));
      if (missingBadges.length > 0) {
        loadedBadges = [...loadedBadges, ...missingBadges];
        saveBadges(loadedBadges);
      }
    }

    const updatedBadges = loadedBadges.map(badge => {
      if (badge.unlocked) return badge;

      let shouldUnlock = false;
      
      if (badge.id === '5' && checkFirstMealLogged()) shouldUnlock = true;
      else if (badge.id === '6' && checkMealCreator()) shouldUnlock = true;
      else if (badge.id === '7' && checkFirstFavorite()) shouldUnlock = true;
      else if (badge.id === '8' && checkScannerPro()) shouldUnlock = true;
      else if (badge.id === '9' && checkListSpecialist()) shouldUnlock = true;
      else if (badge.id === '10' && checkSevenConsecutiveDays()) shouldUnlock = true;
      else if (badge.id === '11' && checkHydrationMarathoner(settings)) shouldUnlock = true;
      else if (badge.id === '12' && checkProPlanner()) shouldUnlock = true;
      else if (badge.id === '13' && checkFavoriteCollector()) shouldUnlock = true;
      else if (badge.id === '14' && checkThirtyConsecutiveDays()) shouldUnlock = true;
      else if (badge.id === '15' && checkHydrationMonarch(settings)) shouldUnlock = true;
      else if (badge.id === '16' && checkSupremeChef()) shouldUnlock = true;
      else if (badge.id === '17' && checkGuruOfFavorites()) shouldUnlock = true;
      else if (badge.id === '18' && checkLegendOfPerseverance()) shouldUnlock = true;

      if (shouldUnlock) {
        return {
          ...badge,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return badge;
    });

    if (updatedBadges.some((b, i) => b.unlocked !== loadedBadges[i].unlocked)) {
      saveBadges(updatedBadges);
    }

    setBadges(updatedBadges);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Statistiche"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="charts" className="flex-1" data-testid="tab-charts">
              <BarChart3 className="w-4 h-4 mr-2" />
              Grafici
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex-1" data-testid="tab-badges">
              <Award className="w-4 h-4 mr-2" />
              Obiettivi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4 mt-4">
            {/* Nutrient Trend - Line chart */}
            <StatisticsChart 
              type="line"
              data={calorieData}
              title="Andamento Nutrienti (7 giorni)"
              data-testid="chart-nutrients"
            />
            
            {/* Macro Distribution - Pie chart */}
            <StatisticsChart 
              type="pie"
              data={macroData}
              title="Distribuzione Macronutrienti Oggi"
              data-testid="chart-macro"
            />

            {/* Hydration Trend - Area chart */}
            <StatisticsChart 
              type="area"
              data={hydrationData}
              title="Idratazione (7 giorni)"
              data-testid="chart-hydration"
            />

            {/* Weight & Calorie Correlation - Composed chart */}
            <StatisticsChart 
              type="composed"
              data={weightCalorieData}
              title="Peso vs Calorie (7 giorni)"
              data-testid="chart-weight-calorie"
            />

            {/* Weekly Consistency - Bar chart */}
            <StatisticsChart 
              type="bar"
              data={consistencyData}
              title="Consistenza Settimanale (Media 30 gg)"
              data-testid="chart-consistency"
            />

            {/* Consumption by Category - Pie chart */}
            <StatisticsChart 
              type="pie"
              data={categoryData}
              title="Consumo per Categoria (30 giorni)"
              data-testid="chart-category"
            />

            {/* Glucose & Insulin Trends - Area chart */}
            <StatisticsChart 
              type="area"
              data={glucoseInsulinData}
              title="Glucosio & Insulina (7 giorni)"
              data-testid="chart-glucose-insulin"
            />

            {/* Top 10 Foods - Custom view with metric selector */}
            <StatisticsChart 
              type="top-foods"
              data={topFoodsData}
              title="Top 10 Cibi"
              metricOptions={['frequenza', 'calorie', 'proteine', 'carboidrati', 'grassi']}
              data-testid="chart-top-foods"
            />
          </TabsContent>

          <TabsContent value="badges" className="space-y-4 mt-4">
            <div className="grid gap-3">
              {badges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
