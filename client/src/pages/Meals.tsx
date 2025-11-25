import TopBar from "@/components/TopBar";
import MealCard from "@/components/MealCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import AddMealDialog from "@/components/AddMealDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Heart, Calendar as CalendarIcon, ShoppingCart, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { loadFoods, loadMeals, saveMeals, loadWeeklyAssignments, assignMealToDay, removeMealFromDay, calculateMealNutrition, saveShoppingLists, loadShoppingLists } from "@/lib/storage";
import type { Meal } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";

export default function Meals() {
  const [activeTab, setActiveTab] = useState<"meals" | "calendar">("meals");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [selectedDayForMeal, setSelectedDayForMeal] = useState<number | null>(null);

  useEffect(() => {
    const loadedFoods = loadFoods();
    const loadedMeals = loadMeals();
    setFoods(loadedFoods);
    setMeals(loadedMeals.map(m => calculateMealNutrition(m, loadedFoods)));
    setAssignments(loadWeeklyAssignments());
  }, []);

  const handleSaveMeal = (newMeal: Meal) => {
    const calculatedMeal = calculateMealNutrition(newMeal, foods);
    const updatedMeals = [...meals, calculatedMeal];
    setMeals(updatedMeals);
    saveMeals(updatedMeals);
    setDialogOpen(false);
  };

  const handleToggleFavorite = (id: string) => {
    const updatedMeals = meals.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m);
    setMeals(updatedMeals);
    saveMeals(updatedMeals);
  };

  const handleDeleteMeal = (id: string) => {
    const updatedMeals = meals.filter(m => m.id !== id);
    setMeals(updatedMeals);
    saveMeals(updatedMeals);
    setMealToDelete(null);
  };

  const handleDayClick = (dayOfWeek: number) => {
    setSelectedDayForMeal(dayOfWeek);
  };

  const handleAssignMealToDay = (dayOfWeek: number, meal: Meal) => {
    assignMealToDay(dayOfWeek, meal.id, meal.name);
    setAssignments(loadWeeklyAssignments());
    setSelectedDayForMeal(null);
  };

  const handleRemoveMealFromDay = (dayOfWeek: number) => {
    removeMealFromDay(dayOfWeek);
    setAssignments(loadWeeklyAssignments());
  };

  const handleGenerateShoppingList = () => {
    const items: Array<{ id: string; name: string; checked: boolean }> = [];
    const addedFoods = new Set<string>();

    assignments.forEach(assignment => {
      const meal = meals.find(m => m.id === assignment.mealId);
      if (meal) {
        meal.ingredients.forEach(ing => {
          const food = foods.find(f => f.id === ing.foodId);
          if (food && !addedFoods.has(food.id)) {
            items.push({
              id: food.id,
              name: `${food.name} (${ing.grams}g)`,
              checked: false,
            });
            addedFoods.add(food.id);
          }
        });
      }
    });

    if (items.length === 0) {
      alert('Nessun pasto assegnato al calendario');
      return;
    }

    const lists = loadShoppingLists();
    const newList = {
      id: Date.now().toString(),
      name: `Spesa Settimanale - ${new Date().toLocaleDateString('it-IT')}`,
      items,
      isPredefined: false,
    };
    lists.push(newList);
    saveShoppingLists(lists);
    alert('Lista spesa generata e salvata!');
  };

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
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Nuovo Pasto
            </Button>

            <div className="space-y-3">
              {meals.length > 0 ? (
                meals.map(meal => (
                  <MealCard 
                    key={meal.id}
                    meal={meal}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToShoppingList={() => console.log('TODO: Add to shopping list')}
                    onAddToCalendar={(id) => {
                      const meal = meals.find(m => m.id === id);
                      if (meal) handleAssignMealToDay(0, meal);
                    }}
                    onClick={(id) => console.log('View meal:', id)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nessun pasto creato. Inizia creando il primo pasto!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 mt-4">
            <WeeklyCalendar 
              weekStart={new Date()}
              assignments={assignments}
              onDayClick={handleDayClick}
              onRemoveMeal={handleRemoveMealFromDay}
            />

            {selectedDayForMeal !== null && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">Seleziona un pasto per {['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][selectedDayForMeal]}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {meals.map(meal => (
                    <Button
                      key={meal.id}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleAssignMealToDay(selectedDayForMeal, meal)}
                      data-testid={`button-assign-meal-${meal.id}`}
                    >
                      <span>{meal.name}</span>
                      <span className="text-xs text-muted-foreground">{meal.totalCalories} kcal</span>
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedDayForMeal(null)}
                >
                  Annulla
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              data-testid="button-generate-shopping-list"
              onClick={handleGenerateShoppingList}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Genera Lista Spesa Settimanale
            </Button>

            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground text-center">
                Clicca sui giorni per assegnare i pasti oppure rimuovi i pasti esistenti
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMeal}
        foods={foods}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!mealToDelete} onOpenChange={(open) => !open && setMealToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Pasto</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo pasto? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mealToDelete && handleDeleteMeal(mealToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
