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
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/languageContext";
import { loadShoppingLists, saveShoppingLists } from "@/lib/storage";

export default function ShoppingLists() {
  const { t, language } = useLanguage();
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [selectedListForItem, setSelectedListForItem] = useState<string | null>(null);
  const [lists, setLists] = useState<any[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadedLists = loadShoppingLists();
    if (loadedLists.length === 0) {
      // Initialize with default lists
      const defaultLists = [
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
      ];
      saveShoppingLists(defaultLists);
      setLists(defaultLists);
    } else {
      setLists(loadedLists);
    }
  }, []);

  // Save lists when they change
  useEffect(() => {
    if (lists.length > 0) {
      saveShoppingLists(lists);
    }
  }, [lists]);

  const handleToggleItem = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map((item: any) => 
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
          items: list.items.map((item: any) => ({ ...item, checked }))
        };
      }
      return list;
    }));
  };


  const handleDeleteList = (id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
  };


  const handleDeleteItem = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter((item: any) => item.id !== itemId)
        };
      }
      return list;
    }));
  };

  const handleAddItem = (listId: string) => {
    setSelectedListForItem(listId);
    setShowNewListDialog(true);
  };

  const handleConfirmAdd = () => {
    if (selectedListForItem && newItemName.trim()) {
      setLists(prev => prev.map(list => {
        if (list.id === selectedListForItem) {
          return {
            ...list,
            items: [...list.items, { id: Date.now().toString(), name: newItemName, checked: false }]
          };
        }
        return list;
      }));
      setNewItemName('');
      setSelectedListForItem(null);
      setShowNewListDialog(false);
    }
  };

  const handleConfirmNewList = () => {
    if (newListName.trim() && !selectedListForItem) {
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
          onClick={() => {
            setSelectedListForItem(null);
            setShowNewListDialog(true);
          }}
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

      {/* Dialog for Add Item or New List */}
      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedListForItem 
                ? (language === 'it' ? 'Aggiungi Elemento' : 'Add Item')
                : (language === 'it' ? 'Crea Nuova Lista' : 'Create New List')}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder={selectedListForItem 
              ? (language === 'it' ? 'Nome elemento...' : 'Item name...')
              : (language === 'it' ? 'Nome lista...' : 'List name...')}
            value={selectedListForItem ? newItemName : newListName}
            onChange={(e) => selectedListForItem ? setNewItemName(e.target.value) : setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (selectedListForItem ? handleConfirmAdd() : handleConfirmNewList())}
            data-testid={selectedListForItem ? "input-new-item" : "input-new-list-name"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
              {t.foods.cancel}
            </Button>
            <Button 
              onClick={selectedListForItem ? handleConfirmAdd : handleConfirmNewList} 
              data-testid={selectedListForItem ? "button-confirm-item" : "button-confirm-new-list"}
            >
              {t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
