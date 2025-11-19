import ShoppingListCard from '../ShoppingListCard';
import { useState } from 'react';

export default function ShoppingListCardExample() {
  const [list, setList] = useState({
    id: "1",
    name: "Spesa Settimanale",
    items: [
      { id: '1', name: 'Pollo', checked: false },
      { id: '2', name: 'Riso', checked: true },
      { id: '3', name: 'Verdure miste', checked: false },
    ],
    isPredefined: false,
  });

  const handleToggleItem = (listId: string, itemId: string) => {
    setList(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  return (
    <div className="p-4">
      <ShoppingListCard 
        list={list}
        onToggleItem={handleToggleItem}
        onDeleteItem={(_, itemId) => console.log('Delete item:', itemId)}
        onDeleteList={(id) => console.log('Delete list:', id)}
        onAddItem={(id) => console.log('Add item to list:', id)}
        onToggleAll={(id, checked) => console.log('Toggle all:', id, checked)}
      />
    </div>
  );
}
