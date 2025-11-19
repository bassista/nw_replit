import TopBar from "@/components/TopBar";
import FoodCard from "@/components/FoodCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Heart } from "lucide-react";
import { useState } from "react";

export default function Foods() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  // Mock data - TODO: remove mock functionality
  const mockFoods = [
    { id: '1', name: 'Petto di Pollo', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, isFavorite: true },
    { id: '2', name: 'Riso Integrale', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, isFavorite: false },
    { id: '3', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 2.6, isFavorite: true },
    { id: '4', name: 'Salmone', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0, isFavorite: false },
    { id: '5', name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, isFavorite: true },
    { id: '6', name: 'Uova', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, isFavorite: false },
  ];

  const filteredFoods = mockFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || (activeTab === "favorites" && food.isFavorite);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Database Cibi"
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
              placeholder="Cerca cibi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            data-testid="button-upload-csv"
            onClick={() => console.log('Upload CSV')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carica File CSV
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1" data-testid="tab-all">
              Tutti ({mockFoods.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1" data-testid="tab-favorites">
              <Heart className="w-4 h-4 mr-2" />
              Preferiti ({mockFoods.filter(f => f.isFavorite).length})
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
                onClick={(id) => console.log('View food details:', id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun cibo trovato</p>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredFoods.length} di {mockFoods.length} cibi
        </div>
      </div>
    </div>
  );
}
