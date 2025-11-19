import TopBar from "@/components/TopBar";
import DiarySection from "@/components/DiarySection";
import WaterTracker from "@/components/WaterTracker";
import NutritionalGoalsCard from "@/components/NutritionalGoalsCard";
import MealScoreCard from "@/components/MealScoreCard";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { it } from "date-fns/locale";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterMl, setWaterMl] = useState(1200);

  // Mock data - TODO: remove mock functionality
  const mockNutrients = [
    { name: 'Calorie', current: 1650, target: 2000, unit: 'kcal', color: 'chart-1' },
    { name: 'Proteine', current: 85, target: 120, unit: 'g', color: 'chart-2' },
    { name: 'Carboidrati', current: 180, target: 250, unit: 'g', color: 'chart-3' },
    { name: 'Grassi', current: 45, target: 65, unit: 'g', color: 'chart-4' },
  ];

  const mockBreakfast = [
    { id: '1', name: 'Cereali integrali', calories: 180, grams: 50 },
    { id: '2', name: 'Latte scremato', calories: 90, grams: 200 },
  ];

  const mockLunch = [
    { id: '3', name: 'Pasta al pomodoro', calories: 350, grams: 100 },
    { id: '4', name: 'Insalata mista', calories: 50, grams: 150 },
  ];

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
            <span className="font-semibold text-foreground">
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

        {/* Diary Sections */}
        <div className="space-y-3">
          <DiarySection 
            mealType="colazione"
            items={mockBreakfast}
            onAddItem={() => console.log('Add to breakfast')}
          />
          <DiarySection 
            mealType="pranzo"
            items={mockLunch}
            onAddItem={() => console.log('Add to lunch')}
          />
          <DiarySection 
            mealType="cena"
            items={[]}
            onAddItem={() => console.log('Add to dinner')}
          />
          <DiarySection 
            mealType="spuntino"
            items={[]}
            onAddItem={() => console.log('Add to snack')}
          />
        </div>
      </div>
    </div>
  );
}
