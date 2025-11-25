import TopBar from "@/components/TopBar";
import MealCard from "@/components/MealCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import AddMealDialog from "@/components/AddMealDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Heart, ShoppingCart, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { loadFoods, loadMeals, saveMeals, loadWeeklyAssignments, assignMealToDay, removeMealFromDay, calculateMealNutrition, saveShoppingLists, loadShoppingLists } from "@/lib/storage";
import type { Meal } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";

export default function Meals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [selectedDayForMeal, setSelectedDayForMeal] = useState<number | null>(null);
  const [draggedMealId, setDraggedMealId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);

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

  const handleMealDragStart = (mealId: string, mealName: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedMealId(mealId);
    e.dataTransfer.setData('mealId', mealId);
    e.dataTransfer.setData('mealName', mealName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnCalendarDay = (dayOfWeek: number, mealId: string, mealName: string) => {
    assignMealToDay(dayOfWeek, mealId, mealName);
    setAssignments(loadWeeklyAssignments());
    setDraggedMealId(undefined);
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

  // Filter meals by search and favorites
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showOnlyFavorites || meal.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Pasti"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Create New Meal Button */}
        <Button
          className="w-full"
          data-testid="button-create-meal"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crea Nuovo Pasto
        </Button>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-go-to-shopping-lists"
            asChild
          >
            <Link href="/lists">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Lista Spesa
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            data-testid="button-toggle-calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <span className="w-4 h-4 mr-2">{showCalendar ? '📅' : '📋'}</span>
            {showCalendar ? 'Nascondi' : 'Mostra'} Calendario
          </Button>
        </div>

        {/* Weekly Calendar */}
        {showCalendar && (
          <WeeklyCalendar 
            weekStart={new Date()}
            assignments={assignments}
            onDayClick={handleDayClick}
            onRemoveMeal={handleRemoveMealFromDay}
            onDropMeal={handleDropOnCalendarDay}
            draggedMealId={draggedMealId}
          />
        )}

        {/* Generate Shopping List Button */}
        <Button
          variant="outline"
          className="w-full"
          data-testid="button-generate-shopping-list"
          onClick={handleGenerateShoppingList}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Genera Lista Spesa Settimanale
        </Button>

        {/* Drag & Drop Suggestion */}
        <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
          <p className="text-xs text-primary font-medium text-center">
            💡 Trascina un pasto sul calendario per assegnarlo, o clicca su un giorno per selezionare
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cerca pasti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-meals"
          />
        </div>

        {/* Favorites Filter Button */}
        <Button
          variant={showOnlyFavorites ? "default" : "outline"}
          className="w-full"
          data-testid="button-toggle-favorites"
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <Heart className={`w-4 h-4 mr-2 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          {showOnlyFavorites ? 'Mostrando: Solo Preferiti' : 'Mostra Solo Preferiti'}
        </Button>

        {/* Meals List */}
        <div className="space-y-3">
          {filteredMeals.length > 0 ? (
            filteredMeals.map(meal => (
              <MealCard 
                key={meal.id}
                meal={meal}
                isDragging={draggedMealId === meal.id}
                onToggleFavorite={handleToggleFavorite}
                onAddToShoppingList={() => console.log('TODO: Add to shopping list')}
                onAddToCalendar={(id) => {
                  const meal = meals.find(m => m.id === id);
                  if (meal) handleAssignMealToDay(0, meal);
                }}
                onClick={(id) => console.log('View meal:', id)}
                onDragStart={handleMealDragStart}
              />
            ))
          ) : meals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun pasto creato. Inizia creando il primo pasto!</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun pasto corrisponde ai filtri applicati</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMeal}
        foods={foods}
      />

      {/* Select Day Meal Dialog */}
      <Dialog open={selectedDayForMeal !== null} onOpenChange={(open) => !open && setSelectedDayForMeal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Seleziona un pasto per {selectedDayForMeal !== null ? ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][selectedDayForMeal] : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {meals.map(meal => (
              <Button
                key={meal.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  if (selectedDayForMeal !== null) {
                    handleAssignMealToDay(selectedDayForMeal, meal);
                  }
                }}
                data-testid={`button-assign-meal-${meal.id}`}
              >
                <span>{meal.name}</span>
                <span className="text-xs text-muted-foreground">{meal.totalCalories} kcal</span>
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedDayForMeal(null)}
              data-testid="button-cancel-select-meal"
            >
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
