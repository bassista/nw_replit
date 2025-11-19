import TopBar from "@/components/TopBar";
import WaterTracker from "@/components/WaterTracker";
import NutritionalGoalsCard from "@/components/NutritionalGoalsCard";
import MealScoreCard from "@/components/MealScoreCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useLanguage } from "@/lib/languageContext";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterMl, setWaterMl] = useState(1200);
  const { t } = useLanguage();

  // Mock data - TODO: remove mock functionality
  const mockNutrients = [
    { name: 'Calorie', current: 1650, target: 2000, unit: 'kcal', color: 'chart-1' },
    { name: 'Proteine', current: 85, target: 120, unit: 'g', color: 'chart-2' },
    { name: 'Carboidrati', current: 180, target: 250, unit: 'g', color: 'chart-3' },
    { name: 'Grassi', current: 45, target: 65, unit: 'g', color: 'chart-4' },
  ];

  const [dailyMealItems, setDailyMealItems] = useState([
    { id: '1', name: 'Cereali integrali', calories: 180, grams: 50 },
    { id: '2', name: 'Latte scremato', calories: 90, grams: 200 },
    { id: '3', name: 'Pasta al pomodoro', calories: 350, grams: 100 },
    { id: '4', name: 'Insalata mista', calories: 50, grams: 150 },
  ]);

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
          targetMl={2000}
          glassCapacityMl={200}
          onAddGlass={() => setWaterMl(prev => prev + 200)}
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
              onClick={() => console.log('Add food to daily meal')}
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
    </div>
  );
}
