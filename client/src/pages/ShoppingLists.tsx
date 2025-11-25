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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/languageContext";
import { loadShoppingLists, saveShoppingLists, loadFoods } from "@/lib/storage";
import type { FoodItem } from "@shared/schema";

export default function ShoppingLists() {
  const { t, language } = useLanguage();
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [selectedListForItem, setSelectedListForItem] = useState<string | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [itemMode, setItemMode] = useState<"food" | "custom">("food");

  // Load data on mount
  useEffect(() => {
    const loadedLists = loadShoppingLists();
    const loadedFoods = loadFoods();
    setFoods(loadedFoods);
    
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
    setItemMode('food');
    setSearchQuery('');
    setActiveTab('all');
    setShowNewListDialog(true);
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || food.isFavorite;
    return matchesSearch && matchesTab;
  });

  const handleAddFood = (food: FoodItem) => {
    if (selectedListForItem) {
      setLists(prev => prev.map(list => {
        if (list.id === selectedListForItem) {
          return {
            ...list,
            items: [...list.items, { id: Date.now().toString(), name: food.name, checked: false }]
          };
        }
        return list;
      }));
      resetItemDialog();
    }
  };

  const handleConfirmCustomItem = () => {
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
      resetItemDialog();
    }
  };

  const resetItemDialog = () => {
    setNewItemName('');
    setSelectedListForItem(null);
    setShowNewListDialog(false);
    setSearchQuery('');
    setActiveTab('all');
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedListForItem 
                ? (language === 'it' ? 'Aggiungi Elemento' : 'Add Item')
                : (language === 'it' ? 'Crea Nuova Lista' : 'Create New List')}
            </DialogTitle>
          </DialogHeader>

          {selectedListForItem ? (
            // Add Item Dialog with Food Selection
            <div className="space-y-4">
              {/* Mode Tabs */}
              <Tabs value={itemMode} onValueChange={(v) => setItemMode(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="food" className="flex-1">
                    {language === 'it' ? 'Seleziona Cibo' : 'Select Food'}
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1">
                    {language === 'it' ? 'Personalizzato' : 'Custom'}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {itemMode === 'food' ? (
                <>
                  {/* Food Selection Mode */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={language === 'it' ? 'Cerca cibo...' : 'Search food...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-food"
                    />
                  </div>

                  {/* Food Tabs */}
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">
                        {language === 'it' ? 'Tutti' : 'All'} ({foods.filter(f => !f.isFavorite || true).length})
                      </TabsTrigger>
                      <TabsTrigger value="favorites" className="flex-1">
                        {language === 'it' ? 'Preferiti' : 'Favorites'} ({foods.filter(f => f.isFavorite).length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Food List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredFoods.length > 0 ? (
                      filteredFoods.map(food => (
                        <button
                          key={food.id}
                          onClick={() => handleAddFood(food)}
                          className="w-full text-left p-3 rounded-md border border-card-border hover-elevate"
                          data-testid={`food-item-${food.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{food.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {food.category} • {food.calories} kcal
                              </p>
                            </div>
                            <Plus className="w-4 h-4 text-primary" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {language === 'it' ? 'Nessun cibo trovato' : 'No foods found'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Custom Text Mode */}
                  <Input
                    placeholder={language === 'it' ? 'Nome elemento...' : 'Item name...'}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConfirmCustomItem()}
                    data-testid="input-custom-item"
                  />
                </>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
                  {t.foods.cancel}
                </Button>
                {itemMode === 'custom' && (
                  <Button 
                    onClick={handleConfirmCustomItem}
                    data-testid="button-confirm-custom-item"
                  >
                    {t.common.add}
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            // Create New List Dialog
            <>
              <Input
                placeholder={language === 'it' ? 'Nome lista...' : 'List name...'}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmNewList()}
                data-testid="input-new-list-name"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
                  {t.foods.cancel}
                </Button>
                <Button 
                  onClick={handleConfirmNewList}
                  data-testid="button-confirm-new-list"
                >
                  {t.common.add}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
