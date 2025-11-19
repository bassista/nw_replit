import WeeklyCalendar from '../WeeklyCalendar';

export default function WeeklyCalendarExample() {
  const mockAssignments = [
    { dayOfWeek: 1, mealId: '1', mealName: 'Pasta Carbonara' },
    { dayOfWeek: 3, mealId: '2', mealName: 'Pollo e Verdure' },
    { dayOfWeek: 5, mealId: '3', mealName: 'Insalata Mista' },
  ];

  return (
    <div className="p-4">
      <WeeklyCalendar 
        weekStart={new Date()}
        assignments={mockAssignments}
        onDayClick={(day) => console.log('Day clicked:', day)}
      />
    </div>
  );
}
