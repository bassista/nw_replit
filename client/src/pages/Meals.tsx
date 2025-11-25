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
import { Plus, Heart, ShoppingCart, Trash2, Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
  const [draggedMealId, setDraggedMealId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [mealToAssignToDay, setMealToAssignToDay] = useState<Meal | null>(null);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  useEffect(() => {
    const loadedFoods = loadFoods();
    const loadedMeals = loadMeals();
    setFoods(loadedFoods);
    setMeals(loadedMeals.map(m => calculateMealNutrition(m, loadedFoods)));
    setAssignments(loadWeeklyAssignments());
  }, []);

  const handleSaveMeal = (newMeal: Meal) => {
    const calculatedMeal = calculateMealNutrition(newMeal, foods);
    
    if (mealToEdit) {
      // Edit existing meal
      const updatedMeals = meals.map(m => m.id === newMeal.id ? calculatedMeal : m);
      setMeals(updatedMeals);
      saveMeals(updatedMeals);
      setMealToEdit(null);
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

  const handleAddMealToShoppingList = (meal: Meal) => {
    const lists = loadShoppingLists();
    
    // Mappa ingredienti in item di lista spesa
    const mealItems = meal.ingredients.map(ing => {
      const food = foods.find(f => f.id === ing.foodId);
      return {
        id: ing.foodId,
        name: `${food?.name || 'Cibo'} (${ing.grams}g)`,
        checked: false,
      };
    });

    if (mealItems.length === 0) {
      toast({
        title: "Pasto vuoto",
        description: "Il pasto non ha ingredienti.",
        variant: "destructive",
      });
      return;
    }

    // Crea una nuova lista con il nome del pasto
    const newList = {
      id: Date.now().toString(),
      name: `${meal.name} - ${new Date().toLocaleDateString('it-IT')}`,
      items: mealItems,
      isPredefined: false,
    };
    lists.push(newList);
    saveShoppingLists(lists);

    toast({
      title: "Lista spesa creata",
      description: `Lista spesa per "${meal.name}" creata con ${mealItems.length} ${mealItems.length === 1 ? 'elemento' : 'elementi'}.`,
    });
  };

  const handleAddMealToDiary = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || meal.ingredients.length === 0) {
      toast({
        title: "Pasto vuoto",
        description: "Il pasto non ha ingredienti.",
        variant: "destructive",
      });
      return;
    }

    // Ottieni il diario di oggi
    const today = new Date().toISOString().split('T')[0];
    const dailyItems = getDailyMeal(today);

    // Aggiungi ogni ingrediente del pasto al diario
    meal.ingredients.forEach(ing => {
      const food = foods.find(f => f.id === ing.foodId);
      if (food) {
        const newItem: DailyMealItem = {
          id: Date.now().toString() + Math.random(),
          foodId: ing.foodId,
          name: ing.name || food.name,
          calories: Math.round(food.calories * ing.grams / 100),
          protein: Math.round(food.protein * ing.grams / 100 * 10) / 10,
          carbs: Math.round(food.carbs * ing.grams / 100 * 10) / 10,
          fat: Math.round(food.fat * ing.grams / 100 * 10) / 10,
          grams: ing.grams,
        };
        dailyItems.push(newItem);
      }
    });

    saveDailyMeal(today, dailyItems);

    toast({
      title: "Pasto aggiunto al diario",
      description: `"${meal.name}" con ${meal.ingredients.length} ${meal.ingredients.length === 1 ? 'ingrediente' : 'ingredienti'} aggiunto al diario di oggi.`,
    });
  };

  const handleGenerateShoppingList = () => {
    const foodMap = new Map<string, { name: string; totalGrams: number; category: string }>();

    assignments.forEach(assignment => {
      const meal = meals.find(m => m.id === assignment.mealId);
      if (meal) {
        meal.ingredients.forEach(ing => {
          const food = foods.find(f => f.id === ing.foodId);
          if (food) {
            if (foodMap.has(food.id)) {
              const existing = foodMap.get(food.id)!;
              existing.totalGrams += ing.grams;
            } else {
              foodMap.set(food.id, {
                name: food.name,
                totalGrams: ing.grams,
                category: food.category || 'Altro',
              });
            }
          }
        });
      }
    });

    if (foodMap.size === 0) {
      toast({
        title: "Nessun pasto",
        description: "Assegna dei pasti al calendario prima di generare la lista spesa.",
        variant: "destructive",
      });
      return;
    }

    // Group by category
    const itemsByCategory = new Map<string, Array<{ id: string; name: string; checked: boolean }>>();
    foodMap.forEach((food, foodId) => {
      const category = food.category || 'Altro';
      if (!itemsByCategory.has(category)) {
        itemsByCategory.set(category, []);
      }
      itemsByCategory.get(category)!.push({
        id: foodId,
        name: `${food.name} (${food.totalGrams}g)`,
        checked: false,
      });
    });

    // Flatten items
    const newItems: Array<{ id: string; name: string; checked: boolean }> = [];
    Array.from(itemsByCategory.values()).forEach(items => {
      newItems.push(...items.sort((a, b) => a.name.localeCompare(b.name)));
    });

    const lists = loadShoppingLists();
    const todayDate = new Date().toLocaleDateString('it-IT');
    const listName = `Spesa Settimanale - ${todayDate}`;
    
    // Cerca se esiste già una lista con lo stesso nome
    const existingListIndex = lists.findIndex(
      list => list.name === listName && !list.isPredefined
    );

    let addedCount = 0;

    if (existingListIndex >= 0) {
      // Lista esiste: aggiungi/aggiorna gli elementi
      const existingList = lists[existingListIndex];
      const existingFoodMap = new Map<string, any>(existingList.items.map(item => [item.id, item]));
      
      newItems.forEach(item => {
        if (existingFoodMap.has(item.id)) {
          // Aggiorna quantità se la struttura lo supporta
          addedCount++;
        } else {
          existingList.items.push(item);
          addedCount++;
        }
      });

      saveShoppingLists(lists);
      toast({
        title: "Lista spesa aggiornata",
        description: `${addedCount} ${addedCount === 1 ? 'elemento' : 'elementi'} in lista spesa. Merging intelligente per ingredienti duplicati.`,
      });
    } else {
      // Lista non esiste: crea una nuova
      const newList = {
        id: Date.now().toString(),
        name: listName,
        items: newItems,
        isPredefined: false,
      };
      lists.push(newList);
      saveShoppingLists(lists);
      toast({
        title: "Lista spesa creata",
        description: `${newItems.length} ${newItems.length === 1 ? 'elemento' : 'elementi'} aggiunto. Raggruppati per categoria.`,
      });
    }
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

        {/* Week Navigation */}
        {showCalendar && (
          <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-muted">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentWeekStart(prev => subDays(prev, 7))}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {format(currentWeekStart, "d MMM", { locale: it })} - {format(addDays(currentWeekStart, 6), "d MMM", { locale: it })}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
              disabled={isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 0 })}
              data-testid="button-current-week"
            >
              Oggi
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
              data-testid="button-next-week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Weekly Calendar */}
        {showCalendar && (
          <>
            <WeeklyCalendar 
              weekStart={currentWeekStart}
              assignments={assignments}
              onDayClick={handleDayClick}
              onRemoveMeal={handleRemoveMealFromDay}
              onDropMeal={handleDropOnCalendarDay}
              draggedMealId={draggedMealId}
            />

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
          </>
        )}

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
                onAddToShoppingList={(id) => {
                  const selectedMeal = meals.find(m => m.id === id);
                  if (selectedMeal) {
                    handleAddMealToShoppingList(selectedMeal);
                  }
                }}
                onAddToCalendar={(id) => {
                  const selectedMeal = meals.find(m => m.id === id);
                  if (selectedMeal) {
                    setMealToAssignToDay(selectedMeal);
                    setShowDaySelector(true);
                  }
                }}
                onAddMealToDiary={handleAddMealToDiary}
                onEdit={(id) => {
                  const mealToEdit = meals.find(m => m.id === id);
                  if (mealToEdit) {
                    setMealToEdit(mealToEdit);
                    setDialogOpen(true);
                  }
                }}
                onDelete={(id) => setMealToDelete(id)}
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

      {/* Add/Edit Meal Dialog */}
      <AddMealDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setMealToEdit(null);
        }}
        onSave={handleSaveMeal}
        foods={foods}
        initialMeal={mealToEdit || undefined}
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

      {/* Select Day for Meal Dialog */}
      <Dialog open={showDaySelector} onOpenChange={(open) => !open && (setShowDaySelector(false), setMealToAssignToDay(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleziona il giorno per "{mealToAssignToDay?.name}"</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'].map((day, dayIndex) => (
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
    </div>
  );
}
