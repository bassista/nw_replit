import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MealScoreCardProps {
  grade: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";
  explanation: string;
  type: "meal" | "day";
}

const gradeColors = {
  "A+": "bg-primary/10 text-primary border-primary",
  "A": "bg-primary/10 text-primary border-primary",
  "A-": "bg-primary/10 text-primary border-primary",
  "B+": "bg-chart-2/10 text-chart-2 border-chart-2",
  "B": "bg-chart-2/10 text-chart-2 border-chart-2",
  "B-": "bg-chart-2/10 text-chart-2 border-chart-2",
  "C+": "bg-chart-3/10 text-chart-3 border-chart-3",
  "C": "bg-chart-3/10 text-chart-3 border-chart-3",
  "C-": "bg-chart-3/10 text-chart-3 border-chart-3",
  "D": "bg-chart-5/10 text-chart-5 border-chart-5",
  "F": "bg-destructive/10 text-destructive border-destructive",
};

export default function MealScoreCard({ grade, explanation, type }: MealScoreCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-lg border-2 ${gradeColors[grade]}`}>
          <span className="text-2xl font-bold">{grade}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground">
              {type === "meal" ? "Punteggio Pasto" : "Punteggio Giornaliero"}
            </h4>
            <Badge variant="outline" className="text-xs">
              {type === "meal" ? "Pasto" : "Giorno"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      </div>
    </Card>
  );
}
