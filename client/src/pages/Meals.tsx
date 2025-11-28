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
import { Plus, Heart, ShoppingCart, Trash2, Search, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { addDays, subDays, startOfWeek, format, isSameWeek } from "date-fns";
import { it } from "date-fns/locale";
import { loadFoods, loadMeals, saveMeals, loadWeeklyAssignments, assignMealToDay, removeMealFromDay, calculateMealNutrition, saveShoppingLists, loadShoppingLists, saveDailyMeal, getDailyMeal } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { Meal, DailyMealItem } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";

export default function Meals() {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [selectedDayForMeal, setSelectedDayForMeal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);
  const [mealToAssignToDay, setMealToAssignToDay] = useState<Meal | null>(null);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [showSelectMealForDay, setShowSelectMealForDay] = useState(false);
  const [selectedDayForMealSelection, setSelectedDayForMealSelection] = useState<number | null>(null);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [showOnlyFavoriteMeals, setShowOnlyFavoriteMeals] = useState(false);
  const [dayNames] = useState(['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']);

  useEffect(() => {
    const loadedFoods = loadFoods();
    const loadedMeals = loadMeals();
    setFoods(loadedFoods);
    setMeals(loadedMeals.map(m => calculateMealNutrition(m, loadedFoods)));
    setAssignments(loadWeeklyAssignments());
    setShoppingLists(loadShoppingLists());
  }, []);

  const handleSaveMeal = (newMeal: Meal) => {
    const calculatedMeal = calculateMealNutrition(newMeal, foods);
    
    if (mealToEdit) {
      // Edit existing meal
      const updatedMeals = meals.map(m => m.id === newMeal.id ? calculatedMeal : m);
      setMeals(updatedMeals);
      saveMeals(updatedMeals);
      setMealToEdit(undefined);
    } else {
      // Add new meal
      const updatedMeals = [...meals, calculatedMeal];
      setMeals(updatedMeals);
      saveMeals(updatedMeals);
    }
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
    setSelectedDayForMealSelection(dayOfWeek);
    setShowSelectMealForDay(true);
    setMealSearchQuery('');
    setShowOnlyFavoriteMeals(false);
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

  const handleAddToShoppingList = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal && meal.ingredients) {
      const newShoppingList = {
        id: Date.now().toString(),
        name: `${meal.name} - ${format(new Date(), 'd MMM yyyy', { locale: it })}`,
        items: meal.ingredients.map((ing: any) => ({
          id: Date.now().toString() + Math.random(),
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          checked: false,
        })),
      };
      const updatedLists = [...shoppingLists, newShoppingList];
      setShoppingLists(updatedLists);
      saveShoppingLists(updatedLists);
      toast({
        title: 'Aggiunto',
        description: `Ingredienti di "${meal.name}" aggiunti alla lista spesa`,
      });
    }
  };

  const handleAddToCalendar = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      setMealToAssignToDay(meal);
      setShowDaySelector(true);
    }
  };

  const handleAddMealToDiary = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      const currentItems = getDailyMeal(dateStr);
      
      // Add each ingredient of the meal to the diary
      const newItems: DailyMealItem[] = meal.ingredients.map(ing => {
        const food = foods.find(f => f.id === ing.foodId);
        const multiplier = ing.grams / 100;
        
        return {
          id: Date.now().toString() + Math.random(),
          foodId: ing.foodId,
          name: food?.name || ing.name || 'Alimento',
          calories: Math.round(food?.calories ? food.calories * multiplier : 0),
          protein: Math.round((food?.protein ? food.protein * multiplier : 0) * 10) / 10,
          carbs: Math.round((food?.carbs ? food.carbs * multiplier : 0) * 10) / 10,
          fat: Math.round((food?.fat ? food.fat * multiplier : 0) * 10) / 10,
          grams: ing.grams,
        };
      });
      
      saveDailyMeal(dateStr, [...currentItems, ...newItems]);
      toast({
        title: 'Aggiunto',
        description: `${meal.ingredients.length} ingredienti di "${meal.name}" aggiunti al diario`,
      });
    }
  };

  const handleAddWeeklyShoppingList = () => {
    // Collect all unique ingredients from weekly meals
    const ingredientMap = new Map<string, any>(); // key is foodId

    assignments.forEach(assignment => {
      if (assignment.mealId) {
        const meal = meals.find(m => m.id === assignment.mealId);
        if (meal && meal.ingredients) {
          meal.ingredients.forEach((ing: any) => {
            if (!ingredientMap.has(ing.foodId)) {
              ingredientMap.set(ing.foodId, {
                id: Date.now().toString() + Math.random(),
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                checked: false,
              });
            }
          });
        }
      }
    });

    if (ingredientMap.size === 0) {
      toast({
        title: 'Nessun pasto assegnato',
        description: 'Assegna almeno un pasto a un giorno della settimana',
        variant: "destructive",
      });
      return;
    }

    const newShoppingList = {
      id: Date.now().toString(),
      name: `Settimana ${format(currentWeekStart, 'd MMM', { locale: it })} - ${format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: it })}`,
      items: Array.from(ingredientMap.values()),
    };

    const updatedLists = [...shoppingLists, newShoppingList];
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);

    toast({
      title: 'Lista spesa creata',
      description: `${ingredientMap.size} ingredienti unici aggiunti alla lista spesa`,
    });
  };

  // Filter meals by search and favorites (for main list)
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showOnlyFavorites || meal.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  // Filter meals for day selection dialog
  const filteredMealsForDay = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(mealSearchQuery.toLowerCase());
    const matchesFavorite = !showOnlyFavoriteMeals || meal.isFavorite;
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
            data-testid="button-add-weekly-shopping-list"
            onClick={handleAddWeeklyShoppingList}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Crea Lista Spesa
          </Button>

          <Button
            variant="outline"
            className="w-full"
            data-testid="button-toggle-calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? '📅 Nascondi' : '📋 Mostra'}
          </Button>
        </div>

        {/* Week Navigation */}
        {showCalendar && (
          <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-muted">
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-previous-week"
              onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentWeekStart, 'd MMM', { locale: it })} - {format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: it })}
            </span>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-next-week"
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Weekly Calendar */}
        {showCalendar && (
          <WeeklyCalendar
            weekStart={currentWeekStart}
            assignments={assignments}
            onDayClick={handleDayClick}
            onRemoveMeal={handleRemoveMealFromDay}
          />
        )}

        {/* Search and Favorites Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca pasto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-meals"
            />
          </div>

          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            className="w-full"
            data-testid="button-toggle-favorites"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <Heart className="w-4 h-4 mr-2" fill={showOnlyFavorites ? "currentColor" : "none"} />
            Solo Preferiti ({meals.filter(m => m.isFavorite).length})
          </Button>
        </div>

        {/* Meals List */}
        <div className="space-y-3">
          {filteredMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {meals.length === 0 ? 'Nessun pasto creato. Crea il primo!' : 'Nessun pasto trovato'}
            </div>
          ) : (
            filteredMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={() => {
                  setMealToEdit(meal);
                  setDialogOpen(true);
                }}
                onEdit={() => {
                  setMealToEdit(meal);
                  setDialogOpen(true);
                }}
                onDelete={() => setMealToDelete(meal.id)}
                onToggleFavorite={() => handleToggleFavorite(meal.id)}
                onAddToShoppingList={() => handleAddToShoppingList(meal.id)}
                onAddToCalendar={() => handleAddToCalendar(meal.id)}
                onAddMealToDiary={() => handleAddMealToDiary(meal.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Meal Dialog */}
      <AddMealDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setMealToEdit(undefined);
        }}
        initialMeal={mealToEdit}
        foods={foods}
        onSave={handleSaveMeal}
      />

      {/* Delete Meal Alert */}
      <AlertDialog open={!!mealToDelete} onOpenChange={(open) => !open && setMealToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo pasto? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-meal">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mealToDelete && handleDeleteMeal(mealToDelete)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-meal"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Day Selection Dialog */}
      <Dialog open={showDaySelector} onOpenChange={(open) => {
        setShowDaySelector(open);
        if (!open) setMealToAssignToDay(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleziona il giorno per "{mealToAssignToDay?.name}"</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {dayNames.map((day, dayIndex) => (
              <Button
                key={dayIndex}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (mealToAssignToDay) {
                    handleAssignMealToDay(dayIndex, mealToAssignToDay);
                    setShowDaySelector(false);
                    setMealToAssignToDay(null);
                  }
                }}
                data-testid={`button-assign-to-day-${dayIndex}`}
              >
                {day}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDaySelector(false);
                setMealToAssignToDay(null);
              }}
              data-testid="button-cancel-day-selection"
            >
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Meal for Day Dialog */}
      <Dialog open={showSelectMealForDay} onOpenChange={(open) => {
        setShowSelectMealForDay(open);
        if (!open) {
          setSelectedDayForMealSelection(null);
          setMealSearchQuery('');
          setShowOnlyFavoriteMeals(false);
        }
      }}>
        <DialogContent className="flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assegna Pasto a {selectedDayForMealSelection !== null ? dayNames[selectedDayForMealSelection] : 'Giorno'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca pasto..."
                value={mealSearchQuery}
                onChange={(e) => setMealSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-meal-for-day"
              />
            </div>

            <Button
              variant={showOnlyFavoriteMeals ? "default" : "outline"}
              className="w-full flex-shrink-0"
              data-testid="button-toggle-favorite-meals-for-day"
              onClick={() => setShowOnlyFavoriteMeals(!showOnlyFavoriteMeals)}
            >
              <Heart className="w-4 h-4 mr-2" fill={showOnlyFavoriteMeals ? "currentColor" : "none"} />
              Solo Preferiti ({meals.filter(m => m.isFavorite).length})
            </Button>

            <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
              {filteredMealsForDay.length > 0 ? (
                filteredMealsForDay.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => {
                      if (selectedDayForMealSelection !== null) {
                        handleAssignMealToDay(selectedDayForMealSelection, meal);
                        setShowSelectMealForDay(false);
                      }
                    }}
                    className="w-full text-left p-3 rounded-md border border-card-border hover-elevate"
                    data-testid={`button-select-meal-${meal.id}-for-day`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{meal.name}</p>
                          {meal.isFavorite && (
                            <Heart className="w-4 h-4 text-destructive fill-destructive flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {meal.ingredientCount} ingredienti • {meal.totalCalories} kcal
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {meals.length === 0 ? 'Nessun pasto creato' : 'Nessun pasto trovato'}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSelectMealForDay(false)}
              data-testid="button-cancel-meal-selection"
            >
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
