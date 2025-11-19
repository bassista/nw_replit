import EditFoodDialog from '../EditFoodDialog';
import { LanguageProvider } from '@/lib/languageContext';
import { useState } from 'react';

export default function EditFoodDialogExample() {
  const [open, setOpen] = useState(true);
  const mockFood = {
    id: "1",
    name: "Petto di Pollo",
    category: "Proteine",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    isFavorite: false,
  };

  const categories = ["Proteine", "Carboidrati", "Verdure", "Frutta", "Latticini"];

  return (
    <LanguageProvider>
      <div className="p-4">
        <EditFoodDialog 
          food={mockFood}
          categories={categories}
          open={open}
          onClose={() => setOpen(false)}
          onSave={(food) => console.log('Save food:', food)}
          onDelete={(id) => console.log('Delete food:', id)}
        />
      </div>
    </LanguageProvider>
  );
}
