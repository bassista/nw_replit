import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays } from "date-fns";
import { it } from "date-fns/locale";

interface WeeklyCalendarProps {
  weekStart: Date;
  assignments: {
    dayOfWeek: number;
    mealId?: string;
    mealName?: string;
  }[];
  onDayClick: (dayOfWeek: number) => void;
}

const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function WeeklyCalendar({ weekStart, assignments, onDayClick }: WeeklyCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(weekStart, { weekStartsOn: 0 }), i);
    const assignment = assignments.find(a => a.dayOfWeek === i);
    
    return {
      dayOfWeek: i,
      date,
      dayName: dayNames[i],
      assignment,
    };
  });

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4">Calendario Settimanale</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.dayOfWeek}
            onClick={() => onDayClick(day.dayOfWeek)}
            className={`p-2 rounded-md text-center hover-elevate active-elevate-2 ${
              day.assignment?.mealId 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-muted border-2 border-transparent'
            }`}
            data-testid={`calendar-day-${day.dayOfWeek}`}
          >
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {day.dayName}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {format(day.date, 'd', { locale: it })}
            </div>
            {day.assignment?.mealName && (
              <Badge variant="secondary" className="mt-2 text-xs truncate w-full">
                {day.assignment.mealName.length > 8 
                  ? day.assignment.mealName.slice(0, 8) + '...' 
                  : day.assignment.mealName}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}
