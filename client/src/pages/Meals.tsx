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
                onEdit={() => {
                  setMealToEdit(meal);
                  setDialogOpen(true);
                }}
                onDelete={() => setMealToDelete(meal.id)}
                onToggleFavorite={() => handleToggleFavorite(meal.id)}
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
          setMealToEdit(null);
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
