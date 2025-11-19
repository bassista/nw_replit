import TopBar from "@/components/TopBar";
import ShoppingListCard from "@/components/ShoppingListCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/languageContext";

export default function ShoppingLists() {
  const { t, language } = useLanguage();
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  
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

  const handleCreateList = () => {
    if (newListName.trim()) {
      setLists(prev => [...prev, {
        id: Date.now().toString(),
        name: newListName,
        items: [],
        isPredefined: false,
      }]);
      setNewListName('');
      setShowNewListDialog(false);
    }
  };

  const handleDeleteList = (id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
  };

  const handleAddItem = (listId: string, itemName: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: [...list.items, { id: Date.now().toString(), name: itemName, checked: false }]
        };
      }
      return list;
    }));
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId)
        };
      }
      return list;
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={t.nav.lists}
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Button
          className="w-full"
          data-testid="button-create-list"
          onClick={() => setShowNewListDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'it' ? 'Crea Nuova Lista' : 'Create New List'}
        </Button>

        <div className="space-y-4">
          {lists.map(list => (
            <ShoppingListCard 
              key={list.id}
              list={list}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onDeleteList={handleDeleteList}
              onAddItem={handleAddItem}
              onToggleAll={handleToggleAll}
            />
          ))}
        </div>
      </div>

      {/* New List Dialog */}
      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'it' ? 'Crea Nuova Lista' : 'Create New List'}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder={language === 'it' ? 'Nome lista...' : 'List name...'}
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
            data-testid="input-new-list-name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
              {t.foods.cancel}
            </Button>
            <Button onClick={handleCreateList} data-testid="button-confirm-new-list">
              {t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
