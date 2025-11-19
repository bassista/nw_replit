import FoodCard from '../FoodCard';

export default function FoodCardExample() {
  const mockFood = {
    id: "1",
    name: "Petto di Pollo",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    isFavorite: true,
  };

  return (
    <div className="p-4">
      <FoodCard 
        food={mockFood}
        onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
        onAdd={(id) => console.log('Add food:', id)}
        onClick={(id) => console.log('Click food:', id)}
      />
    </div>
  );
}
