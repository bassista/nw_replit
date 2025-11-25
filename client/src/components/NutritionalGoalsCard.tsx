import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface NutrientProgress {
  name: string;
  current: number;
  target?: number;
  unit: string;
  color: string;
  isExtra?: boolean;
}

interface NutritionalGoalsCardProps {
  nutrients: NutrientProgress[];
}

export default function NutritionalGoalsCard({ nutrients }: NutritionalGoalsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mainNutrients = nutrients.filter(n => !n.isExtra);
  const extraNutrients = nutrients.filter(n => n.isExtra);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Obiettivi Nutrizionali</h3>
        {extraNutrients.length > 0 && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-expanded-nutrients"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {mainNutrients.map((nutrient, index) => {
          const percentage = nutrient.target ? Math.min((nutrient.current / nutrient.target) * 100, 100) : 0;
          const isComplete = nutrient.target && percentage >= 100;
          
          return (
            <div key={nutrient.name} className="space-y-2" data-testid={`nutrient-${nutrient.name.toLowerCase()}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{nutrient.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {nutrient.current} / {nutrient.target} {nutrient.unit}
                  </span>
                  {isComplete && (
                    <Badge variant="default" className="text-xs">✓</Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  // @ts-ignore
                  '--progress-background': `hsl(var(--chart-${index + 1}))`
                }}
              />
            </div>
          );
        })}

        {isExpanded && extraNutrients.length > 0 && (
          <div className="pt-2 border-t border-card-border mt-4 space-y-3">
            {extraNutrients.map((nutrient, index) => (
              <div key={nutrient.name} className="space-y-1" data-testid={`nutrient-${nutrient.name.toLowerCase()}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{nutrient.name}</span>
                  <span className="text-sm font-medium text-foreground">
                    {nutrient.current} {nutrient.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
