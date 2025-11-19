import TopBar from "@/components/TopBar";
import MealCard from "@/components/MealCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Heart, Calendar as CalendarIcon, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function Meals() {
  const [activeTab, setActiveTab] = useState<"meals" | "calendar">("meals");

  // Mock data - TODO: remove mock functionality
  const mockMeals = [
    { id: '1', name: 'Pasta Carbonara', totalCalories: 450, totalProtein: 18, totalCarbs: 65, totalFat: 12, ingredientCount: 4, isFavorite: true },
    { id: '2', name: 'Pollo e Verdure', totalCalories: 380, totalProtein: 42, totalCarbs: 28, totalFat: 8, ingredientCount: 5, isFavorite: false },
    { id: '3', name: 'Insalata Proteica', totalCalories: 320, totalProtein: 35, totalCarbs: 15, totalFat: 14, ingredientCount: 6, isFavorite: true },
  ];

  const mockCalendarAssignments = [
    { dayOfWeek: 1, mealId: '1', mealName: 'Pasta Carbonara' },
    { dayOfWeek: 3, mealId: '2', mealName: 'Pollo e Verdure' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Pasti"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="meals" className="flex-1" data-testid="tab-meals">
              <Plus className="w-4 h-4 mr-2" />
              I Miei Pasti
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1" data-testid="tab-calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="space-y-4 mt-4">
            <Button
              className="w-full"
              data-testid="button-create-meal"
              onClick={() => console.log('Create new meal')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Nuovo Pasto
            </Button>

            <div className="space-y-3">
              {mockMeals.map(meal => (
                <MealCard 
                  key={meal.id}
                  meal={meal}
                  onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                  onAddToShoppingList={(id) => console.log('Add to shopping list:', id)}
                  onAddToCalendar={(id) => console.log('Add to calendar:', id)}
                  onClick={(id) => console.log('View meal:', id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 mt-4">
            <WeeklyCalendar 
              weekStart={new Date()}
              assignments={mockCalendarAssignments}
              onDayClick={(day) => console.log('Day clicked:', day)}
            />

            <Button
              variant="outline"
              className="w-full"
              data-testid="button-generate-shopping-list"
              onClick={() => console.log('Generate shopping list from calendar')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Genera Lista Spesa Settimanale
            </Button>

            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground text-center">
                Trascina i pasti sui giorni del calendario per pianificare la settimana
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
