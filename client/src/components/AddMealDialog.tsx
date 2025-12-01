import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FoodItem } from "@shared/schema";
import type { Meal, MealIngredient } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddMealDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  foods: FoodItem[];
  initialMeal?: Meal;
}

export default function AddMealDialog({ open, onClose, onSave, foods, initialMeal }: AddMealDialogProps) {
  const [mealName, setMealName] = useState(initialMeal?.name || "");
  const [ingredients, setIngredients] = useState<MealIngredient[]>(initialMeal?.ingredients || []);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [selectedGrams, setSelectedGrams] = useState("100");
  const [showFoodDialog, setShowFoodDialog] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [foodDialogTab, setFoodDialogTab] = useState<"all" | "favorites">("all");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>("all");
  
  // Get unique categories from foods
  const categories = Array.from(new Set(foods.map(f => f.category))).sort();

  // Reset form when dialog opens/closes or initialMeal changes
  useEffect(() => {
    if (open && initialMeal) {
      setMealName(initialMeal.name);
      setIngredients(initialMeal.ingredients);
    } else if (!open) {
      setMealName("");
      setIngredients([]);
      setSelectedFoodId("");
      setSelectedGrams("100");
      setFoodSearchQuery("");
      setSelectedFoodCategory("all");
      setFoodDialogTab("all");
    }
  }, [open, initialMeal]);
  
  // Set favorites as default if there are favorite foods
  useEffect(() => {
    if (showFoodDialog) {
      const favoriteFoods = foods.filter(f => f.isFavorite);
      if (favoriteFoods.length > 0) {
        setFoodDialogTab("favorites");
      }
    }
  }, [showFoodDialog, foods]);
  
  // Filter foods based on search, category, and favorites
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(foodSearchQuery.toLowerCase());
    const matchesCategory = selectedFoodCategory === "all" || food.category === selectedFoodCategory;
    const matchesFavorites = foodDialogTab === "all" || (foodDialogTab === "favorites" && food.isFavorite);
    return matchesSearch && matchesCategory && matchesFavorites;
  });
  
  const handleSelectFood = (foodId: string) => {
    setSelectedFoodId(foodId);
    setShowFoodDialog(false);
  };

  const handleAddIngredient = () => {
    if (!selectedFoodId) return;
    const food = foods.find(f => f.id === selectedFoodId);
    if (!food) return;

    const newIngredient: MealIngredient = {
      foodId: selectedFoodId,
      grams: parseInt(selectedGrams),
      name: food.name,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedFoodId("");
    setSelectedGrams("100");
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!mealName.trim() || ingredients.length === 0) return;

    const newMeal: Meal = {
      id: initialMeal?.id || Date.now().toString(),
      name: mealName.trim(),
      ingredients,
      isFavorite: initialMeal?.isFavorite || false,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      ingredientCount: ingredients.length,
    };

    onSave(newMeal);
    setMealName("");
    setIngredients([]);
    setSelectedFoodId("");
    setSelectedGrams("100");
  };

  const selectedFood = foods.find(f => f.id === selectedFoodId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialMeal ? 'Modifica Pasto' : 'Crea Nuovo Pasto'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal Name */}
          <div className="space-y-2">
            <Label>Nome Pasto</Label>
            <Input
              placeholder="es. Pasta alla Carbonara"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              data-testid="input-meal-name"
            />
          </div>

          {/* Add Ingredients */}
          <div className="space-y-2 border-t pt-4">
            <Label>Aggiungi Ingredienti</Label>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowFoodDialog(true)}
                data-testid="button-select-food"
              >
                <Search className="w-4 h-4 mr-2" />
                {selectedFood ? selectedFood.name : 'Seleziona un alimento...'}
              </Button>

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Grammi</Label>
                  <Input
                    type="number"
                    min="10"
                    max="1000"
                    value={selectedGrams}
                    onChange={(e) => setSelectedGrams(e.target.value)}
                    data-testid="input-grams"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Calorie (100g)</Label>
                  <div className="text-sm p-2 bg-muted rounded">
                    {selectedFood?.calories || 0}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddIngredient}
                disabled={!selectedFoodId}
                data-testid="button-add-ingredient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Ingrediente
              </Button>
            </div>
          </div>

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label>Ingredienti ({ingredients.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ingredients.map((ing, idx) => {
                  const food = foods.find(f => f.id === ing.foodId);
                  const calories = food ? Math.round(food.calories * ing.grams / 100) : 0;
                  return (
                    <Card key={idx} className="p-2 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ing.name}</p>
                        <p className="text-xs text-muted-foreground">{ing.grams}g ({calories} kcal)</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveIngredient(idx)}
                        data-testid={`button-remove-ingredient-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={!mealName.trim() || ingredients.length === 0}
            data-testid="button-save-meal"
          >
            {initialMeal ? 'Salva Modifiche' : 'Crea Pasto'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Food Selection Dialog */}
      <Dialog open={showFoodDialog} onOpenChange={(isOpen) => {
        setShowFoodDialog(isOpen);
        if (!isOpen) {
          setFoodSearchQuery("");
          setSelectedFoodCategory("all");
          setFoodDialogTab("all");
        }
      }}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleziona Alimento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ricerca alimento..."
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-food-meal"
              />
            </div>

            <Tabs value={foodDialogTab} onValueChange={(value) => setFoodDialogTab(value as "all" | "favorites")} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1" data-testid="tab-all-foods-meal">
                  Tutti
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1" data-testid="tab-favorite-foods-meal">
                  Preferiti
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3 border rounded-lg p-3 bg-muted/20 flex-shrink-0">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoria</Label>
                <select
                  value={selectedFoodCategory}
                  onChange={(e) => setSelectedFoodCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                  data-testid="select-category-meal"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun alimento trovato
                </div>
              ) : (
                filteredFoods.map(food => (
                  <Button
                    key={food.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSelectFood(food.id)}
                    data-testid={`button-food-${food.id}`}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.category}</p>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
