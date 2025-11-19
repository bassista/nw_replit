import DiarySection from '../DiarySection';

export default function DiarySectionExample() {
  const mockItems = [
    { id: '1', name: 'Cereali integrali', calories: 180, grams: 50 },
    { id: '2', name: 'Latte scremato', calories: 90, grams: 200 },
    { id: '3', name: 'Banana', calories: 105, grams: 120 },
  ];

  return (
    <div className="p-4">
      <DiarySection 
        mealType="colazione"
        items={mockItems}
        onAddItem={() => console.log('Add item to breakfast')}
      />
    </div>
  );
}
