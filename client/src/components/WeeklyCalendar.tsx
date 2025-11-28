import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { useDroppable } from "@dnd-kit/core";

interface WeeklyCalendarProps {
  weekStart: Date;
  assignments: {
    dayOfWeek: number;
    mealId?: string;
    mealName?: string;
  }[];
  onDayClick: (dayOfWeek: number) => void;
  onRemoveMeal?: (dayOfWeek: number) => void;
  onDropMeal?: (dayOfWeek: number, mealId: string, mealName: string) => void;
}

const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function WeeklyCalendar({ weekStart, assignments, onDayClick, onRemoveMeal, onDropMeal }: WeeklyCalendarProps) {
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
          <DayDropZone
            key={day.dayOfWeek}
            day={day}
            onDayClick={onDayClick}
            onRemoveMeal={onRemoveMeal}
            onDropMeal={onDropMeal}
          />
        ))}
      </div>
    </Card>
  );
}

interface DayDropZoneProps {
  day: {
    dayOfWeek: number;
    date: Date;
    dayName: string;
    assignment?: {
      dayOfWeek: number;
      mealId?: string;
      mealName?: string;
    };
  };
  onDayClick: (dayOfWeek: number) => void;
  onRemoveMeal?: (dayOfWeek: number) => void;
  onDropMeal?: (dayOfWeek: number, mealId: string, mealName: string) => void;
}

function DayDropZone({ day, onDayClick, onRemoveMeal, onDropMeal }: DayDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.dayOfWeek}`,
    data: {
      type: 'day',
      dayOfWeek: day.dayOfWeek,
    },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const mealId = e.dataTransfer.getData('mealId');
    const mealName = e.dataTransfer.getData('mealName');
    if (mealId && mealName && onDropMeal) {
      onDropMeal(day.dayOfWeek, mealId, mealName);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className="relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <button
        onClick={() => onDayClick(day.dayOfWeek)}
        className={`w-full p-2 rounded-md text-center hover-elevate active-elevate-2 transition-colors ${
          isOver ? 'bg-primary/30 border-2 border-primary' : (
            day.assignment?.mealId 
              ? 'bg-primary/10 border-2 border-primary' 
              : 'bg-muted border-2 border-dashed border-muted-foreground/30'
          )
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
      {day.assignment?.mealId && onRemoveMeal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveMeal(day.dayOfWeek);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-xs font-bold hover:bg-destructive/80"
          data-testid={`button-remove-meal-${day.dayOfWeek}`}
          title="Rimuovi pasto"
        >
          ×
        </button>
      )}
    </div>
  );
}
