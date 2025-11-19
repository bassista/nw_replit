import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus } from "lucide-react";

interface WaterTrackerProps {
  mlConsumed: number;
  targetMl: number;
  glassCapacityMl: number;
  onAddGlass: () => void;
}

export default function WaterTracker({ 
  mlConsumed, 
  targetMl, 
  glassCapacityMl, 
  onAddGlass 
}: WaterTrackerProps) {
  const percentage = Math.min((mlConsumed / targetMl) * 100, 100);
  const glassesConsumed = Math.floor(mlConsumed / glassCapacityMl);
  const remainingMl = Math.max(targetMl - mlConsumed, 0);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Idratazione</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {mlConsumed} / {targetMl} ml
          </div>
        </div>

        <Progress value={percentage} className="h-2" data-testid="progress-water" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-2xl font-bold text-primary">{glassesConsumed}</p>
            <p className="text-xs text-muted-foreground">bicchieri bevuti</p>
          </div>
          
          <Button
            size="lg"
            onClick={onAddGlass}
            className="h-16 w-16 rounded-full"
            data-testid="button-add-glass"
          >
            <div className="flex flex-col items-center gap-1">
              <Plus className="w-5 h-5" />
              <Droplet className="w-4 h-4" />
            </div>
          </Button>
          
          <div className="flex-1 text-right space-y-1">
            <p className="text-2xl font-bold text-foreground">{remainingMl}</p>
            <p className="text-xs text-muted-foreground">ml rimanenti</p>
          </div>
        </div>

        {percentage >= 100 && (
          <div className="text-center p-2 bg-primary/10 rounded-md">
            <p className="text-sm font-medium text-primary">
              🎉 Obiettivo raggiunto!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
