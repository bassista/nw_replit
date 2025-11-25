import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
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
}

export default function AddMealDialog({ open, onClose, onSave, foods }: AddMealDialogProps) {
  const [mealName, setMealName] = useState("");
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [selectedGrams, setSelectedGrams] = useState("100");

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
      id: Date.now().toString(),
      name: mealName.trim(),
      ingredients,
      isFavorite: false,
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
          <DialogTitle>Crea Nuovo Pasto</DialogTitle>
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
              <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                <SelectTrigger data-testid="select-food">
                  <SelectValue placeholder="Seleziona un cibo..." />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {foods.map(food => (
                    <SelectItem key={food.id} value={food.id}>
                      {food.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            Crea Pasto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
