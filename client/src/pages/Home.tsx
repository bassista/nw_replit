import TopBar from "@/components/TopBar";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Search, Edit, Beef, Wheat, Droplets, Flame, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useLanguage } from "@/lib/languageContext";
import { getDailyMeal, saveDailyMeal, loadSettings, getWaterIntake, saveWaterIntake, loadFoods, calculateDailyScore, loadMeals, loadWeeklyAssignments, isAutoMealCopyPrompted, markAutoMealCopyPrompted, type DailyMealItem, type Meal } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Home() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterMl, setWaterMl] = useState(0);
  const [dailyMealItems, setDailyMealItems] = useState<DailyMealItem[]>([]);
  const [settings, setSettings] = useState(loadSettings());
  const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] = useState<FoodItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showSelectMealDialog, setShowSelectMealDialog] = useState(false);
  const [showAutoMealCopyDialog, setShowAutoMealCopyDialog] = useState(false);
  const [autoMealToCopy, setAutoMealToCopy] = useState<Meal | null>(null);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [showCopyFromPastDialog, setShowCopyFromPastDialog] = useState(false);
  const [daysBackInput, setDaysBackInput] = useState('1');
  const [showClearDayConfirm, setShowClearDayConfirm] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const { t } = useLanguage();

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load data when date changes
  useEffect(() => {
    const items = getDailyMeal(dateKey);
    const water = getWaterIntake(dateKey);
    setDailyMealItems(items);
    setWaterMl(water);
    setAvailableFoods(loadFoods());
    const meals = loadMeals();
    setAvailableMeals(meals);

    // Check if we should auto-prompt to copy meal
    if (items.length === 0) {
      // Check if already prompted today using storage interface
      if (!isAutoMealCopyPrompted(dateKey)) {
        // Check if there's a meal assigned for today
        const dayOfWeek = currentDate.getDay();
        const assignments = loadWeeklyAssignments();
        const assignment = assignments.find(a => a.dayOfWeek === dayOfWeek);

        if (assignment) {
          const mealForDay = meals.find(m => m.id === assignment.mealId);
          if (mealForDay && mealForDay.ingredients.length > 0) {
            setAutoMealToCopy(mealForDay);
            setShowAutoMealCopyDialog(true);
            // Mark as prompted for this day using storage interface
            markAutoMealCopyPrompted(dateKey);
          }
        }
      }
    }
  }, [dateKey, currentDate]);

  // Save daily meal when items change
  useEffect(() => {
    saveDailyMeal(dateKey, dailyMealItems);
  }, [dailyMealItems, dateKey]);

  // Save water intake when it changes
  useEffect(() => {
    saveWaterIntake(dateKey, waterMl);
  }, [waterMl, dateKey]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFoodForQuantity(food);
    setSelectedQuantity(100);
    setEditingItemId(null);
    setShowAddFoodDialog(false);
    setShowQuantityDialog(true);
  };

  const handleConfirmQuantity = () => {
    if (!selectedFoodForQuantity) return;

    const gramsMultiplier = selectedQuantity / 100;
    const newItem: DailyMealItem = {
      id: editingItemId || Date.now().toString(),
      foodId: selectedFoodForQuantity.id,
      name: selectedFoodForQuantity.name,
      calories: Math.round(selectedFoodForQuantity.calories * gramsMultiplier),
      protein: Math.round(selectedFoodForQuantity.protein * gramsMultiplier),
      carbs: Math.round(selectedFoodForQuantity.carbs * gramsMultiplier),
      fat: Math.round(selectedFoodForQuantity.fat * gramsMultiplier),
      grams: selectedQuantity,
    };

    if (editingItemId) {
      setDailyMealItems(prev => prev.map(item => item.id === editingItemId ? newItem : item));
    } else {
      setDailyMealItems(prev => [...prev, newItem]);
    }

    setShowQuantityDialog(false);
    setSelectedFoodForQuantity(null);
    setSearchQuery('');
  };

  const handleEditQuantity = (item: DailyMealItem) => {
    const food = availableFoods.find(f => f.id === item.foodId);
    if (food) {
      setSelectedFoodForQuantity(food);
      setSelectedQuantity(item.grams);
      setEditingItemId(item.id);
      setShowQuantityDialog(true);
    }
  };

  const handleCopyFromMeal = () => {
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = currentDate.getDay();
    const assignments = loadWeeklyAssignments();
    const assignment = assignments.find(a => a.dayOfWeek === dayOfWeek);

    if (assignment) {
      // Auto-copy meal for current day
      const meal = availableMeals.find(m => m.id === assignment.mealId);
      if (meal) {
        copyMealToDiary(meal);
      }
    } else {
      // Show dialog to select meal
      setShowSelectMealDialog(true);
    }
  };

  const copyMealToDiary = (meal: Meal) => {
    if (!meal || meal.ingredients.length === 0) {
      toast({
        title: "Pasto vuoto",
        description: "Il pasto non ha ingredienti.",
        variant: "destructive",
      });
      return;
    }

    // Accumulate all ingredients from the meal
    const newItems: DailyMealItem[] = [];
    meal.ingredients.forEach(ing => {
      const food = availableFoods.find(f => f.id === ing.foodId);
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
        newItems.push(newItem);
      }
    });

    // Add all items at once
    setDailyMealItems(prev => [...prev, ...newItems]);

    toast({
      title: "Pasto copiato",
      description: `"${meal.name}" con ${meal.ingredients.length} ${meal.ingredients.length === 1 ? 'ingrediente' : 'ingredienti'} aggiunto al diario.`,
    });

    setShowSelectMealDialog(false);
  };

  const handleCopyFromPast = () => {
    const daysBack = parseInt(daysBackInput);
    if (isNaN(daysBack) || daysBack < 1) {
      toast({
        title: "Valore non valido",
        description: "Inserisci un numero positivo di giorni.",
        variant: "destructive",
      });
      return;
    }

    const pastDate = subDays(currentDate, daysBack);
    const pastDateKey = format(pastDate, 'yyyy-MM-dd');
    const pastItems = getDailyMeal(pastDateKey);

    if (pastItems.length === 0) {
      toast({
        title: "Nessun alimento trovato",
        description: `Nessun alimento nel diario di ${daysBack} giorno/i fa.`,
        variant: "destructive",
      });
      return;
    }

    // Copy items with new IDs
    pastItems.forEach(item => {
      const newItem: DailyMealItem = {
        ...item,
        id: Date.now().toString() + Math.random(),
      };
      setDailyMealItems(prev => [...prev, newItem]);
    });

    toast({
      title: "Alimenti copiati",
      description: `${pastItems.length} ${pastItems.length === 1 ? 'alimento' : 'alimenti'} copiato/i da ${daysBack} giorno/i fa.`,
    });

    setShowCopyFromPastDialog(false);
    setDaysBackInput('1');
  };

  const handleClearDay = () => {
    setDailyMealItems([]);
    toast({
      title: "Diario pulito",
      description: "Tutti gli alimenti sono stati rimossi.",
    });
    setShowClearDayConfirm(false);
  };

  const handleDragStart = (itemId: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '0.7';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDrop = (targetIndex: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '1';
    
    if (!draggedItemId) return;
    
    const draggedIndex = dailyMealItems.findIndex(item => item.id === draggedItemId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedItemId(null);
      return;
    }
    
    // Reorder items
    const newItems = [...dailyMealItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setDailyMealItems(newItems);
    setDraggedItemId(null);
  };

  const filteredFoods = availableFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate nutrients from daily meal
  const calculateNutrients = () => {
    const currentCalories = dailyMealItems.reduce((sum, item) => sum + item.calories, 0);
    const currentProtein = dailyMealItems.reduce((sum, item) => sum + item.protein, 0);
    const currentCarbs = dailyMealItems.reduce((sum, item) => sum + item.carbs, 0);
    const currentFat = dailyMealItems.reduce((sum, item) => sum + item.fat, 0);

    // Calculate extra nutrients (fibra, zucchero, sodio)
    let currentFiber = 0;
    let currentSugar = 0;
    let currentSodium = 0;

    dailyMealItems.forEach(item => {
      const food = availableFoods.find(f => f.id === item.foodId);
      if (food) {
        const gramsMultiplier = item.grams / 100;
        currentFiber += (food.fiber || 0) * gramsMultiplier;
        currentSugar += (food.sugar || 0) * gramsMultiplier;
        currentSodium += (food.sodium || 0) * gramsMultiplier;
      }
    });

    return [
      { name: 'Calorie', current: currentCalories, target: settings.calorieGoal, unit: 'kcal', color: 'chart-1' },
      { name: 'Proteine', current: currentProtein, target: settings.proteinGoal, unit: 'g', color: 'chart-2' },
      { name: 'Carboidrati', current: currentCarbs, target: settings.carbsGoal, unit: 'g', color: 'chart-3' },
      { name: 'Grassi', current: currentFat, target: settings.fatGoal, unit: 'g', color: 'chart-4' },
      { name: 'Fibra', current: Math.round(currentFiber * 10) / 10, unit: 'g', color: 'chart-5', isExtra: true },
      { name: 'Zucchero', current: Math.round(currentSugar * 10) / 10, unit: 'g', color: 'chart-5', isExtra: true },
      { name: 'Sodio', current: Math.round(currentSodium), unit: 'mg', color: 'chart-5', isExtra: true },
    ];
  };

  const mockNutrients = calculateNutrients();

  // Calculate dynamic daily score and explanation
  const calculateScoreExplanation = (): { grade: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F"; explanation: string } => {
    const gradeStr = calculateDailyScore(dateKey, settings);
    const grade = gradeStr as "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";
    
    const totalCalories = dailyMealItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = dailyMealItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = dailyMealItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = dailyMealItems.reduce((sum, item) => sum + item.fat, 0);
    const foodVariety = new Set(dailyMealItems.map(item => item.foodId)).size;

    let explanation = '';
    const calorieRatio = totalCalories / settings.calorieGoal;
    const proteinRatio = totalProtein / settings.proteinGoal;
    const carbsRatio = totalCarbs / settings.carbsGoal;
    const fatRatio = totalFat / settings.fatGoal;

    // Check if no food
    if (dailyMealItems.length === 0) {
      return {
        grade: 'F',
        explanation: 'Inizia ad aggiungere alimenti al tuo diario!'
      };
    }

    // Generate specific feedback based on nutrients
    const issues: string[] = [];
    const strengths: string[] = [];

    if (calorieRatio < 0.8) {
      issues.push('calorie troppo basse');
    } else if (calorieRatio > 1.2) {
      issues.push('calorie troppo alte');
    } else {
      strengths.push('calorie ben bilanciate');
    }

    if (proteinRatio < 0.8) {
      issues.push('proteine insufficienti');
    } else if (proteinRatio > 1.2) {
      issues.push('proteine eccessive');
    } else {
      strengths.push('proteine ottimali');
    }

    if (carbsRatio < 0.8) {
      issues.push('carboidrati troppo bassi');
    } else if (carbsRatio > 1.2) {
      issues.push('carboidrati eccessivi');
    } else {
      strengths.push('carboidrati perfetti');
    }

    if (fatRatio < 0.8) {
      issues.push('grassi insufficienti');
    } else if (fatRatio > 1.2) {
      issues.push('grassi eccessivi');
    } else {
      strengths.push('grassi bilanciati');
    }

    // Build explanation
    if (issues.length === 0) {
      explanation = `Perfetto! ${strengths.slice(0, 2).join(', ')}. Varietà: ${foodVariety} cibi diversi.`;
    } else if (strengths.length >= 2) {
      explanation = `Bene! ${strengths.slice(0, 2).join(', ')}. Attenzione: ${issues[0]}.`;
    } else {
      explanation = `Da migliorare: ${issues.slice(0, 2).join(', ')}. Varietà: ${foodVariety} cibi.`;
    }

    return { grade, explanation };
  };

  const { grade, explanation } = calculateScoreExplanation();

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

        {/* Daily Meal Section */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md">
          <div className="p-4 bg-muted/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{t.diary.dailyMeal}</h3>
            <Badge variant="secondary" className="font-semibold">
              {dailyMealItems.reduce((sum, item) => sum + item.calories, 0)} kcal
            </Badge>
          </div>

          <div className="divide-y divide-card-border">
            {dailyMealItems.length > 0 ? (
              dailyMealItems.map((item, index) => (
                <div 
                  key={item.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(item.id, e)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(index, e)}
                  className={`p-4 flex items-center justify-between cursor-move transition-opacity ${
                    draggedItemId === item.id ? 'opacity-50' : ''
                  }`}
                  onClick={() => handleEditQuantity(item)}
                  data-testid={`daily-item-${item.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <div className="flex gap-2 mt-2 flex-wrap items-center">
                      <span className="text-sm text-muted-foreground">{item.grams}g</span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.calories}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Beef className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.protein}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wheat className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.carbs}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.fat}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline">{item.calories} kcal</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQuantity(item);
                      }}
                      data-testid={`button-edit-${item.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item.id);
                      }}
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

          <div className="p-4 border-t border-card-border space-y-2">
            <Button
              onClick={() => setShowAddFoodDialog(true)}
              variant="default"
              className="w-full"
              data-testid="button-add-daily-food"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.diary.addFood}
            </Button>
            {availableMeals.length > 0 && (
              <Button
                onClick={handleCopyFromMeal}
                variant="outline"
                className="w-full"
                data-testid="button-copy-meal-to-diary"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copia dal Pasto
              </Button>
            )}
            <Button
              onClick={() => setShowCopyFromPastDialog(true)}
              variant="outline"
              className="w-full"
              data-testid="button-copy-from-past"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copia da Giorni Passati
            </Button>
            {dailyMealItems.length > 0 && (
              <Button
                onClick={() => setShowClearDayConfirm(true)}
                variant="destructive"
                className="w-full"
                data-testid="button-clear-day"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Pulisci Giorno
              </Button>
            )}
          </div>
        </Card>

        {/* Daily Score */}
        <MealScoreCard 
          grade={grade}
          explanation={explanation}
          type="day"
        />

        {/* Nutritional Goals */}
        <NutritionalGoalsCard nutrients={mockNutrients} />
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
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left p-3 rounded-md border border-card-border hover-elevate"
                    data-testid={`food-option-${food.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.category} • {food.calories} kcal (per 100g)
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Alimento</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo alimento dal diario? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1"
              onClick={() => {
                if (itemToDelete) {
                  setDailyMealItems(prev => prev.filter(i => i.id !== itemToDelete));
                  setItemToDelete(null);
                }
              }}
              data-testid="button-confirm-delete"
            >
              Elimina
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quantity Dialog */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>
              {editingItemId ? 'Modifica Quantità' : 'Seleziona Quantità'}
            </DialogTitle>
          </DialogHeader>

          {selectedFoodForQuantity && (
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-foreground mb-2">{selectedFoodForQuantity.name}</p>
                <p className="text-sm text-muted-foreground">{selectedFoodForQuantity.category}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Quantità: {selectedQuantity}g
                  </Label>
                  <Slider
                    value={[selectedQuantity]}
                    onValueChange={(value) => setSelectedQuantity(Math.max(10, value[0]))}
                    min={10}
                    max={500}
                    step={5}
                    data-testid="slider-quantity"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>10g</span>
                    <span>500g</span>
                  </div>
                </div>

                {/* Nutritional Preview */}
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm font-semibold text-foreground mb-3">Valori nutrizionali (per {selectedQuantity}g):</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Calorie</p>
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(selectedFoodForQuantity.calories * (selectedQuantity / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Proteine</p>
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(selectedFoodForQuantity.protein * (selectedQuantity / 100))}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(selectedFoodForQuantity.carbs * (selectedQuantity / 100))}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Grassi</p>
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(selectedFoodForQuantity.fat * (selectedQuantity / 100))}g
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQuantityDialog(false)}
                  data-testid="button-cancel-quantity"
                >
                  Annulla
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleConfirmQuantity}
                  data-testid="button-confirm-quantity"
                >
                  Conferma
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Select Meal Dialog */}
      <Dialog open={showSelectMealDialog} onOpenChange={setShowSelectMealDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleziona Pasto da Copiare</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {availableMeals.length > 0 ? (
              availableMeals.map(meal => (
                <button
                  key={meal.id}
                  onClick={() => copyMealToDiary(meal)}
                  className="w-full text-left p-4 rounded-md border border-card-border hover-elevate space-y-2"
                  data-testid={`button-select-meal-${meal.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{meal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {meal.ingredientCount} {meal.ingredientCount === 1 ? 'ingrediente' : 'ingredienti'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{meal.totalCalories} kcal</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nessun pasto disponibile. Crea un pasto nella sezione Pasti.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-copy Meal Dialog */}
      <AlertDialog open={showAutoMealCopyDialog} onOpenChange={setShowAutoMealCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copiare Pasto nel Diario?</AlertDialogTitle>
            <AlertDialogDescription>
              Hai il pasto "{autoMealToCopy?.name}" associato a oggi. Vuoi aggiungere i suoi {autoMealToCopy?.ingredientCount} {autoMealToCopy?.ingredientCount === 1 ? 'ingrediente' : 'ingredienti'} al diario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel data-testid="button-cancel-auto-copy">
            No, grazie
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (autoMealToCopy) {
                copyMealToDiary(autoMealToCopy);
              }
              setShowAutoMealCopyDialog(false);
            }}
            data-testid="button-confirm-auto-copy"
          >
            Sì, copia
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy from Past Dialog */}
      <Dialog open={showCopyFromPastDialog} onOpenChange={setShowCopyFromPastDialog}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Copia da Giorni Passati</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Quanti giorni fa?
              </Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={daysBackInput}
                onChange={(e) => setDaysBackInput(e.target.value)}
                placeholder="Inserisci il numero di giorni..."
                data-testid="input-days-back"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ad esempio: 1 = ieri, 7 = una settimana fa
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowCopyFromPastDialog(false);
                setDaysBackInput('1');
              }}
              data-testid="button-cancel-copy-past"
            >
              Annulla
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleCopyFromPast}
              data-testid="button-confirm-copy-past"
            >
              Copia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Day Confirmation Dialog */}
      <AlertDialog open={showClearDayConfirm} onOpenChange={setShowClearDayConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pulisci Diario?</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler rimuovere tutti gli alimenti da oggi? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel data-testid="button-cancel-clear-day">
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearDay}
            data-testid="button-confirm-clear-day"
          >
            Sì, pulisci
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
