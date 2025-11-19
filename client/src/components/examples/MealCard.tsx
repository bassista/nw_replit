import MealCard from '../MealCard';

export default function MealCardExample() {
  const mockMeal = {
    id: "1",
    name: "Pasta al Pomodoro",
    totalCalories: 450,
    totalProtein: 12,
    totalCarbs: 75,
    totalFat: 8,
    ingredientCount: 4,
    isFavorite: false,
  };

  return (
    <div className="p-4">
      <MealCard 
        meal={mockMeal}
        onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
        onAddToShoppingList={(id) => console.log('Add to shopping list:', id)}
        onAddToCalendar={(id) => console.log('Add to calendar:', id)}
        onClick={(id) => console.log('Click meal:', id)}
      />
    </div>
  );
}
