import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Calendar, Edit2, Trash2, Beef, Wheat, Droplets, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    ingredientCount: number;
    isFavorite?: boolean;
  };
  onToggleFavorite?: (id: string) => void;
  onAddToShoppingList?: (id: string) => void;
  onAddToCalendar?: (id: string) => void;
  onAddMealToDiary?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onDragStart?: (mealId: string, mealName: string, e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
}

export default function MealCard({ 
  meal, 
  onToggleFavorite, 
  onAddToShoppingList,
  onAddToCalendar,
  onAddMealToDiary,
  onEdit,
  onDelete,
  onClick,
  onDragStart,
  isDragging
}: MealCardProps) {
  return (
    <Card 
      className={`p-4 hover-elevate cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={() => onClick?.(meal.id)}
      data-testid={`card-meal-${meal.id}`}
      draggable
      onDragStart={(e) => onDragStart?.(meal.id, meal.name, e)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{meal.name}</h3>
              {meal.isFavorite && (
                <Heart className="w-4 h-4 text-destructive fill-destructive flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {meal.ingredientCount} ingredienti
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(meal.id);
            }}
            data-testid={`button-favorite-${meal.id}`}
          >
            <Heart className={`w-4 h-4 ${meal.isFavorite ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            {meal.totalCalories} kcal
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Beef className="w-3 h-3" />
            {meal.totalProtein}g
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Wheat className="w-3 h-3" />
            {meal.totalCarbs}g
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            {meal.totalFat}g
          </Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {onAddToShoppingList && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-max"
              onClick={(e) => {
                e.stopPropagation();
                onAddToShoppingList(meal.id);
              }}
              data-testid={`button-shopping-${meal.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Lista Spesa
            </Button>
          )}
          {onAddToCalendar && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-max"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCalendar(meal.id);
              }}
              data-testid={`button-calendar-${meal.id}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </Button>
          )}
          {onAddMealToDiary && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-w-max"
              onClick={(e) => {
                e.stopPropagation();
                onAddMealToDiary(meal.id);
              }}
              data-testid={`button-add-meal-to-diary-${meal.id}`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Diario
            </Button>
          )}
          {onEdit && (
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(meal.id);
              }}
              data-testid={`button-edit-${meal.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meal.id);
              }}
              data-testid={`button-delete-${meal.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
