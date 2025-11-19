import NutritionalGoalsCard from '../NutritionalGoalsCard';

export default function NutritionalGoalsCardExample() {
  const mockNutrients = [
    { name: 'Calorie', current: 1650, target: 2000, unit: 'kcal', color: 'chart-1' },
    { name: 'Proteine', current: 85, target: 120, unit: 'g', color: 'chart-2' },
    { name: 'Carboidrati', current: 180, target: 250, unit: 'g', color: 'chart-3' },
    { name: 'Grassi', current: 45, target: 65, unit: 'g', color: 'chart-4' },
  ];

  return (
    <div className="p-4">
      <NutritionalGoalsCard nutrients={mockNutrients} />
    </div>
  );
}
