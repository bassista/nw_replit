import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useRef } from "react";

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
  draggedMealId?: string;
}

const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function WeeklyCalendar({ weekStart, assignments, onDayClick, onRemoveMeal, onDropMeal, draggedMealId }: WeeklyCalendarProps) {
  const [touchData, setTouchData] = useState<{ mealId?: string; mealName?: string } | null>(null);
  const touchStartRef = useRef<HTMLElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/20');
  };

  const handleDrop = (dayOfWeek: number, e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/20');
    const mealId = e.dataTransfer.getData('mealId');
    const mealName = e.dataTransfer.getData('mealName');
    if (mealId && mealName && onDropMeal) {
      onDropMeal(dayOfWeek, mealId, mealName);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, dayElement: HTMLElement) => {
    const mealId = e.currentTarget.getAttribute('data-meal-id');
    const mealName = e.currentTarget.getAttribute('data-meal-name');
    if (mealId) {
      setTouchData({ mealId, mealName: mealName || undefined });
      touchStartRef.current = dayElement;
      dayElement.classList.add('bg-primary/20');
    }
  };

  const handleTouchEnd = (dayOfWeek: number, e: React.TouchEvent) => {
    if (touchData?.mealId && onDropMeal) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element?.getAttribute('data-day-index') !== null) {
        onDropMeal(dayOfWeek, touchData.mealId, touchData.mealName || '');
      }
    }
    if (touchStartRef.current) {
      touchStartRef.current.classList.remove('bg-primary/20');
    }
    setTouchData(null);
  };
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
          <div 
            key={day.dayOfWeek} 
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(day.dayOfWeek, e)}
            data-day-index={day.dayOfWeek}
          >
            <button
              onClick={() => onDayClick(day.dayOfWeek)}
              className={`w-full p-2 rounded-md text-center hover-elevate active-elevate-2 transition-colors ${
                day.assignment?.mealId 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-muted border-2 border-dashed border-muted-foreground/30'
              }`}
              data-testid={`calendar-day-${day.dayOfWeek}`}
              data-meal-id={day.assignment?.mealId}
              data-meal-name={day.assignment?.mealName}
              onTouchStart={(e) => handleTouchStart(e, e.currentTarget)}
              onTouchEnd={(e) => handleTouchEnd(day.dayOfWeek, e)}
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
        ))}
      </div>
    </Card>
  );
}
