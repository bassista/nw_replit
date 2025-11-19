import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface DiarySectionProps {
  mealType: "colazione" | "pranzo" | "cena" | "spuntino";
  items: {
    id: string;
    name: string;
    calories: number;
    grams: number;
  }[];
  onAddItem: () => void;
}

const mealTypeLabels = {
  colazione: "Colazione",
  pranzo: "Pranzo",
  cena: "Cena",
  spuntino: "Spuntino",
};

const mealTypeIcons = {
  colazione: "☕",
  pranzo: "🍝",
  cena: "🍽️",
  spuntino: "🍎",
};

export default function DiarySection({ mealType, items, onAddItem }: DiarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover-elevate active-elevate-2"
        data-testid={`button-expand-${mealType}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mealTypeIcons[mealType]}</span>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{mealTypeLabels[mealType]}</h3>
            <p className="text-sm text-muted-foreground">{items.length} elementi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-semibold">
            {totalCalories} kcal
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-card-border">
          {items.length > 0 ? (
            <div className="divide-y divide-card-border">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 flex items-center justify-between"
                  data-testid={`diary-item-${item.id}`}
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.grams}g</p>
                  </div>
                  <Badge variant="outline">{item.calories} kcal</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Nessun alimento registrato
            </div>
          )}
          
          <div className="p-4 border-t border-card-border">
            <Button
              onClick={onAddItem}
              variant="outline"
              className="w-full"
              data-testid={`button-add-${mealType}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Alimento
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
