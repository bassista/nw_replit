import TopBar from "@/components/TopBar";
import ShoppingListCard from "@/components/ShoppingListCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ShoppingLists() {
  const [lists, setLists] = useState([
    {
      id: '1',
      name: 'Pasti',
      items: [
        { id: '1', name: 'Pollo', checked: false },
        { id: '2', name: 'Pasta', checked: true },
      ],
      isPredefined: true,
    },
    {
      id: '2',
      name: 'Spesa Settimanale',
      items: [
        { id: '3', name: 'Latte', checked: false },
        { id: '4', name: 'Uova', checked: false },
        { id: '5', name: 'Verdure miste', checked: true },
      ],
      isPredefined: false,
    },
  ]);

  const handleToggleItem = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return list;
    }));
  };

  const handleToggleAll = (listId: string, checked: boolean) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => ({ ...item, checked }))
        };
      }
      return list;
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Liste della Spesa"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Button
          className="w-full"
          data-testid="button-create-list"
          onClick={() => console.log('Create new list')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crea Nuova Lista
        </Button>

        <div className="space-y-4">
          {lists.map(list => (
            <ShoppingListCard 
              key={list.id}
              list={list}
              onToggleItem={handleToggleItem}
              onDeleteItem={(listId, itemId) => console.log('Delete item:', listId, itemId)}
              onDeleteList={(id) => console.log('Delete list:', id)}
              onAddItem={(id) => console.log('Add item to list:', id)}
              onToggleAll={handleToggleAll}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
