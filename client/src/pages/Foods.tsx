import TopBar from "@/components/TopBar";
import FoodCard from "@/components/FoodCard";
import EditFoodDialog from "@/components/EditFoodDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Upload, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import type { FoodItem } from "@shared/schema";
import { useLanguage } from "@/lib/languageContext";
import { loadFoods, saveFoods, loadCategories, saveCategories } from "@/lib/storage";

export default function Foods() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { t } = useLanguage();

  // Load data on mount
  useEffect(() => {
    const loadedFoods = loadFoods();
    if (loadedFoods.length === 0) {
      // Initialize with default foods if empty
      const defaultFoods: FoodItem[] = [
        { id: '1', name: 'Petto di Pollo', category: 'Proteine', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, isFavorite: true },
        { id: '2', name: 'Riso Integrale', category: 'Carboidrati', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, isFavorite: false },
        { id: '3', name: 'Broccoli', category: 'Verdure', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 2.6, isFavorite: true },
        { id: '4', name: 'Salmone', category: 'Proteine', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0, isFavorite: false },
        { id: '5', name: 'Avocado', category: 'Frutta', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, isFavorite: true },
        { id: '6', name: 'Uova', category: 'Proteine', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, isFavorite: false },
      ];
      saveFoods(defaultFoods);
      setFoods(defaultFoods);
    } else {
      setFoods(loadedFoods);
    }
    setCategories(loadCategories());
  }, []);

  // Save foods when they change
  useEffect(() => {
    if (foods.length > 0) {
      saveFoods(foods);
    }
  }, [foods]);

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || (activeTab === "favorites" && food.isFavorite);
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory;
    return matchesSearch && matchesTab && matchesCategory;
  });

  const handleSaveFood = (food: FoodItem) => {
    setFoods(prev => prev.map(f => f.id === food.id ? food : f));
  };

  const handleDeleteFood = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={t.foods.title}
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search and Upload */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.foods.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder={t.foods.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.foods.allCategories}</SelectItem>
                {categories.sort().map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              data-testid="button-upload-csv"
              onClick={() => console.log('Upload CSV')}
            >
              <Upload className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1" data-testid="tab-all">
              {t.foods.all} ({foods.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1" data-testid="tab-favorites">
              <Heart className="w-4 h-4 mr-2" />
              {t.foods.favorites} ({foods.filter(f => f.isFavorite).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Food List */}
        <div className="space-y-3">
          {filteredFoods.length > 0 ? (
            filteredFoods.map(food => (
              <FoodCard 
                key={food.id}
                food={food}
                onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                onAdd={(id) => console.log('Add food:', id)}
                onClick={(id) => {
                  setEditingFood(food);
                  setDialogOpen(true);
                }}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.foods.noFoodsFound}</p>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        <div className="text-center text-sm text-muted-foreground">
          {t.foods.showing} {filteredFoods.length} {t.foods.of} {foods.length} {t.foods.items}
        </div>
      </div>

      <EditFoodDialog 
        food={editingFood}
        categories={categories}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveFood}
        onDelete={handleDeleteFood}
      />
    </div>
  );
}
