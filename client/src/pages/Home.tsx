import TopBar from "@/components/TopBar";
import WaterTracker from "@/components/WaterTracker";
import NutritionalGoalsCard from "@/components/NutritionalGoalsCard";
import MealScoreCard from "@/components/MealScoreCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useLanguage } from "@/lib/languageContext";
import { getDailyMeal, saveDailyMeal, loadSettings, getWaterIntake, saveWaterIntake, loadFoods } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterMl, setWaterMl] = useState(0);
  const [dailyMealItems, setDailyMealItems] = useState<Array<{ id: string; name: string; calories: number; grams: number }>>([]);
  const [settings, setSettings] = useState(loadSettings());
  const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);
  const { t } = useLanguage();

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load data when date changes
  useEffect(() => {
    const items = getDailyMeal(dateKey);
    const water = getWaterIntake(dateKey);
    setDailyMealItems(items);
    setWaterMl(water);
    setAvailableFoods(loadFoods());
  }, [dateKey]);

  // Save daily meal when items change
  useEffect(() => {
    saveDailyMeal(dateKey, dailyMealItems);
  }, [dailyMealItems, dateKey]);

  // Save water intake when it changes
  useEffect(() => {
    saveWaterIntake(dateKey, waterMl);
  }, [waterMl, dateKey]);

  const handleAddFood = (food: FoodItem) => {
    const newItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      grams: 100,
    };
    setDailyMealItems(prev => [...prev, newItem]);
    setShowAddFoodDialog(false);
    setSearchQuery('');
  };

  const filteredFoods = availableFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate nutrients from daily meal
  const calculateNutrients = () => {
    const currentCalories = dailyMealItems.reduce((sum, item) => sum + item.calories, 0);
    const currentProtein = Math.round(currentCalories * 0.35 / 4); // Rough estimation
    const currentCarbs = Math.round(currentCalories * 0.45 / 4);
    const currentFat = Math.round(currentCalories * 0.20 / 9);

    return [
      { name: 'Calorie', current: currentCalories, target: settings.calorieGoal, unit: 'kcal', color: 'chart-1' },
      { name: 'Proteine', current: currentProtein, target: settings.proteinGoal, unit: 'g', color: 'chart-2' },
      { name: 'Carboidrati', current: currentCarbs, target: settings.carbsGoal, unit: 'g', color: 'chart-3' },
      { name: 'Grassi', current: currentFat, target: settings.fatGoal, unit: 'g', color: 'chart-4' },
    ];
  };

  const mockNutrients = calculateNutrients();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Diario Alimentare"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentDate(prev => subDays(prev, 1))}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-sm">
              {format(currentDate, "EEEE, d MMMM yyyy", { locale: it })}
            </span>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
            data-testid="button-next-day"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Daily Score */}
        <MealScoreCard 
          grade="A-"
          explanation="Ottimo bilanciamento dei nutrienti oggi! Potresti aggiungere più verdure alla cena."
          type="day"
        />

        {/* Nutritional Goals */}
        <NutritionalGoalsCard nutrients={mockNutrients} />

        {/* Water Tracker */}
        <WaterTracker 
          mlConsumed={waterMl}
          targetMl={settings.waterTargetMl}
          glassCapacityMl={settings.glassCapacityMl}
          onAddGlass={() => setWaterMl(prev => prev + settings.glassCapacityMl)}
        />

        {/* Daily Meal Section */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{t.diary.dailyMeal}</h3>
            <Badge variant="secondary" className="font-semibold">
              {dailyMealItems.reduce((sum, item) => sum + item.calories, 0)} kcal
            </Badge>
          </div>

          <div className="divide-y divide-card-border">
            {dailyMealItems.length > 0 ? (
              dailyMealItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 flex items-center justify-between hover-elevate"
                  data-testid={`daily-item-${item.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.grams}g</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.calories} kcal</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDailyMealItems(prev => prev.filter(i => i.id !== item.id))}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                {t.diary.noItems}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-card-border">
            <Button
              onClick={() => setShowAddFoodDialog(true)}
              variant="default"
              className="w-full"
              data-testid="button-add-daily-food"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.diary.addFood}
            </Button>
          </div>
        </Card>
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFoodDialog} onOpenChange={setShowAddFoodDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.diary.addFood}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.foods.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-add-food"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFoods.length > 0 ? (
                filteredFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleAddFood(food)}
                    className="w-full text-left p-3 rounded-md border border-card-border hover-elevate"
                    data-testid={`food-option-${food.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.category} • {food.calories} kcal
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t.foods.noFoodsFound}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
