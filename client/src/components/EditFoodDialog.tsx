import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { FoodItem } from "@shared/schema";
import { useLanguage } from "@/lib/languageContext";

interface EditFoodDialogProps {
  food: FoodItem | null;
  categories: string[];
  open: boolean;
  onClose: () => void;
  onSave: (food: FoodItem) => void;
  onDelete?: (id: string) => void;
}

export default function EditFoodDialog({
  food,
  categories,
  open,
  onClose,
  onSave,
  onDelete,
}: EditFoodDialogProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FoodItem>(
    food || {
      id: "",
      name: "",
      category: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      isFavorite: false,
    }
  );

  // Update formData when food changes
  useEffect(() => {
    if (food) {
      setFormData(food);
    }
  }, [food, open]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (food && onDelete) {
      onDelete(food.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.foods.editFood}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.foods.name}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-food-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t.foods.category}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder={t.foods.category} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">{t.foods.calories}</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-calories"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">{t.foods.protein} (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                min="0"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-protein"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">{t.foods.carbs} (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                min="0"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-carbs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">{t.foods.fat} (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                min="0"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-fat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiber">{t.foods.fiber} (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                min="0"
                value={formData.fiber || 0}
                onChange={(e) => setFormData({ ...formData, fiber: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-fiber"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sugar">{t.foods.sugar} (g)</Label>
              <Input
                id="sugar"
                type="number"
                step="0.1"
                min="0"
                value={formData.sugar || 0}
                onChange={(e) => setFormData({ ...formData, sugar: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-sugar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sodium">{t.foods.sodium} (mg)</Label>
              <Input
                id="sodium"
                type="number"
                step="0.1"
                min="0"
                value={formData.sodium || 0}
                onChange={(e) => setFormData({ ...formData, sodium: Math.max(0, parseFloat(e.target.value)) })}
                data-testid="input-sodium"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {food && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="button-delete-food"
            >
              {t.foods.delete}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            {t.foods.cancel}
          </Button>
          <Button onClick={handleSave} data-testid="button-save-food">
            {t.foods.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
