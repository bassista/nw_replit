import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface NutrientProgress {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface NutritionalGoalsCardProps {
  nutrients: NutrientProgress[];
}

export default function NutritionalGoalsCard({ nutrients }: NutritionalGoalsCardProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4">Obiettivi Nutrizionali</h3>
      <div className="space-y-4">
        {nutrients.map((nutrient) => {
          const percentage = Math.min((nutrient.current / nutrient.target) * 100, 100);
          const isComplete = percentage >= 100;
          
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
                  '--progress-background': `hsl(var(--chart-${nutrients.indexOf(nutrient) + 1}))`
                }}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
