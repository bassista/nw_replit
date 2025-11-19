import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Beef, Wheat, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@shared/schema";

interface FoodCardProps {
  food: FoodItem;
  onToggleFavorite?: (id: string) => void;
  onAdd?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function FoodCard({ food, onToggleFavorite, onAdd, onClick }: FoodCardProps) {
  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer"
      onClick={() => onClick?.(food.id)}
      data-testid={`card-food-${food.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{food.name}</h3>
            {food.isFavorite && (
              <Heart className="w-4 h-4 text-destructive fill-destructive flex-shrink-0" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {food.calories} kcal
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Beef className="w-3 h-3" />
              {food.protein}g
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Wheat className="w-3 h-3" />
              {food.carbs}g
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {food.fat}g
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(food.id);
            }}
            data-testid={`button-favorite-${food.id}`}
          >
            <Heart className={`w-4 h-4 ${food.isFavorite ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
          {onAdd && (
            <Button
              size="icon"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(food.id);
              }}
              data-testid={`button-add-${food.id}`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
