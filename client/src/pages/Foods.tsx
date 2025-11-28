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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Heart, Plus, ChevronLeft, ChevronRight, Barcode, Loader, X, ChevronUp, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import type { FoodItem } from "@shared/schema";
import { useLanguage } from "@/lib/languageContext";
import { loadFoods, saveFoods, loadCategories, saveCategories, loadSettings, saveDailyMeal, getDailyMeal } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Foods() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [selectedFoodForDiary, setSelectedFoodForDiary] = useState<FoodItem | null>(null);
  const [diaryGrams, setDiaryGrams] = useState(100);
  const { t } = useLanguage();

  // Load data on mount
  useEffect(() => {
    const loadedFoods = loadFoods();
    const settings = loadSettings();
    setItemsPerPage(settings.itemsPerPage);
    
    if (loadedFoods.length === 0) {
      // Initialize with default foods if empty
      const defaultFoods: FoodItem[] = [
        { id: '1', name: 'Petto di Pollo', category: 'Proteine', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, isFavorite: true, gramsPerServing: 100 },
        { id: '2', name: 'Riso Integrale', category: 'Carboidrati', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, isFavorite: false, gramsPerServing: 100 },
        { id: '3', name: 'Broccoli', category: 'Verdure', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 2.6, isFavorite: true, gramsPerServing: 100 },
        { id: '4', name: 'Salmone', category: 'Proteine', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0, isFavorite: false, gramsPerServing: 100 },
        { id: '5', name: 'Avocado', category: 'Frutta', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, isFavorite: true, gramsPerServing: 100 },
        { id: '6', name: 'Uova', category: 'Proteine', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, isFavorite: false, gramsPerServing: 100 },
      ];
      saveFoods(defaultFoods);
      setFoods(defaultFoods);
      // Set favorites as default
      const favoriteFoods = defaultFoods.filter(f => f.isFavorite);
      if (favoriteFoods.length > 0) {
        setActiveTab("favorites");
      }
    } else {
      setFoods(loadedFoods);
      // Set favorites as default if there are favorite foods
      const favoriteFoods = loadedFoods.filter(f => f.isFavorite);
      if (favoriteFoods.length > 0) {
        setActiveTab("favorites");
      }
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFoods = filteredFoods.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, selectedCategory]);

  // Initialize camera scanner when cameraActive becomes true
  useEffect(() => {
    if (cameraActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader");
        if (element) {
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              facingMode: "environment",
              showTorchButtonIfSupported: true,
              disableFlip: false,
            } as any,
            false
          );

          scannerRef.current = scanner;

          scanner.render(
            (decodedText) => {
              // Barcode rilevato
              setBarcodeInput(decodedText);
              scanner.clear();
              setCameraActive(false);
              searchProductByBarcode(decodedText);
            },
            (error) => {
              // Errore durante la scansione
              console.error("QR Scanner error:", error);
            }
          );
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [cameraActive]);

  const handleSaveFood = (food: FoodItem) => {
    // Check if it's a new food or an edit
    const existingFood = foods.find(f => f.id === food.id);
    if (existingFood) {
      // Edit existing food
      setFoods(prev => prev.map(f => f.id === food.id ? food : f));
    } else {
      // Add new food
      setFoods(prev => [...prev, food]);
    }
  };

  const handleDeleteFood = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setFoods(prev => prev.map(f => 
      f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
    ));
  };

  const handleAddNewFood = () => {
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: '',
      category: categories[0] || 'Proteine',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      isFavorite: false,
      gramsPerServing: 100,
    };
    setEditingFood(newFood);
    setDialogOpen(true);
  };

  const requestCameraPermission = async () => {
    try {
      // Request camera permission and find back-facing camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Camera permission denied:", error);
      toast({
        title: "Permesso Fotocamera",
        description: "Permesso negato. Abilita l'accesso alla fotocamera nelle impostazioni.",
        variant: "destructive"
      });
      return false;
    }
  };

  const searchProductByBarcode = async (code: string) => {
    setIsScanning(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`
      );
      
      if (!response.ok || response.status === 404) {
        toast({
          title: "Prodotto non trovato",
          description: `Nessun prodotto trovato con codice ${code}.`,
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      const data = await response.json();
      const product = data.product;

      if (!product || !product.product_name) {
        toast({
          title: "Dati incompleti",
          description: "Il prodotto trovato non ha informazioni complete.",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      // Estrai nutrienti per 100g
      const nutrients = product.nutriments || {};
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: product.product_name,
        category: product.categories || 'Altro',
        calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy_100g'] / 4.184 || 0),
        protein: Math.round((nutrients['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((nutrients['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((nutrients['fat_100g'] || 0) * 10) / 10,
        fiber: Math.round((nutrients['fiber_100g'] || 0) * 10) / 10,
        isFavorite: false,
        gramsPerServing: 100,
      };

      setFoods(prev => [...prev, newFood]);
      setBarcodeInput("");
      setCameraActive(false);
      setBarcodeScannerOpen(false);
      setIsScanning(false);

      // Stoppa lo scanner
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      toast({
        title: "Prodotto aggiunto",
        description: `"${newFood.name}" è stato aggiunto al database.`,
      });
    } catch (error) {
      console.error('Barcode scan error:', error);
      toast({
        title: "Errore nella scansione",
        description: "Non è stato possibile recuperare i dati del prodotto.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const handleStartCamera = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setCameraActive(true);
      // Lo scanner verrà inizializzato dal useEffect quando cameraActive diventa true
    }
  };

  const handleStopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setCameraActive(false);
  };

  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Codice mancante",
        description: "Inserisci un codice a barre valido.",
        variant: "destructive",
      });
      return;
    }

    await searchProductByBarcode(barcodeInput);
  };

  const handleAddFoodToDiary = (foodId: string) => {
    const food = foods.find(f => f.id === foodId);
    if (food) {
      setSelectedFoodForDiary(food);
      setDiaryGrams(food.gramsPerServing || 100);
      setDiaryDialogOpen(true);
    }
  };

  const handleConfirmAddToDiary = () => {
    if (!selectedFoodForDiary) {
      toast({
        title: "Errore",
        description: "Seleziona un cibo.",
        variant: "destructive",
      });
      return;
    }

    const grams = diaryGrams;
    if (isNaN(grams) || grams <= 0) {
      toast({
        title: "Quantità non valida",
        description: "Inserisci un numero positivo.",
        variant: "destructive",
      });
      return;
    }

    // Calcola i nutrienti per la quantità specificata
    const baseGrams = selectedFoodForDiary.gramsPerServing || 100;
    const multiplier = grams / baseGrams;
    const today = new Date().toISOString().split('T')[0];
    const dailyItems = getDailyMeal(today);

    const newItem = {
      id: Date.now().toString(),
      foodId: selectedFoodForDiary.id,
      name: selectedFoodForDiary.name,
      calories: Math.round(selectedFoodForDiary.calories * multiplier),
      protein: Math.round(selectedFoodForDiary.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFoodForDiary.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFoodForDiary.fat * multiplier * 10) / 10,
      grams,
    };

    dailyItems.push(newItem);
    saveDailyMeal(today, dailyItems);

    toast({
      title: "Aggiunto al diario",
      description: `${selectedFoodForDiary.name} (${grams}g) aggiunto al diario.`,
    });

    setDiaryDialogOpen(false);
    setSelectedFoodForDiary(null);
    setDiaryGrams(100);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={t.foods.title}
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Add and Scan Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            data-testid="button-add-food"
            onClick={handleAddNewFood}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.common.add}
          </Button>
          <Button
            variant="outline"
            data-testid="button-scan-barcode"
            onClick={() => setBarcodeScannerOpen(true)}
          >
            <Barcode className="w-4 h-4 mr-2" />
            Scansiona
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 items-end">
          <div className="relative flex-1">
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="select-category-filter" className="w-40">
              <SelectValue placeholder={t.foods.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.foods.allCategories}</SelectItem>
              {categories.sort().map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {paginatedFoods.length > 0 ? (
            paginatedFoods.map(food => (
              <FoodCard 
                key={food.id}
                food={food}
                onToggleFavorite={handleToggleFavorite}
                onAddToDiary={handleAddFoodToDiary}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-sm text-muted-foreground text-center">
              {t.foods.showing} {startIndex + 1}-{Math.min(endIndex, filteredFoods.length)} {t.foods.of} {filteredFoods.length} {t.foods.items}
              <br />
              Pagina {currentPage} di {totalPages} (max {itemsPerPage}/pagina)
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <EditFoodDialog 
        food={editingFood}
        categories={categories}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveFood}
        onDelete={handleDeleteFood}
      />

      {/* Add Food to Diary Dialog */}
      <Dialog open={diaryDialogOpen} onOpenChange={setDiaryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aggiungi "{selectedFoodForDiary?.name}" al Diario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <Label>Quantità (g)</Label>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setDiaryGrams(Math.max(1, diaryGrams - 5))}
                    data-testid="button-decrease-diary-quantity"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={diaryGrams}
                    onChange={(e) => setDiaryGrams(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 h-9 text-center"
                    data-testid="input-diary-grams"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setDiaryGrams(Math.min(500, diaryGrams + 5))}
                    data-testid="button-increase-diary-quantity"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[diaryGrams]}
                onValueChange={(value) => setDiaryGrams(value[0])}
                min={1}
                max={500}
                step={5}
                data-testid="slider-diary-quantity"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                I nutrienti sono calcolati per {diaryGrams}g
              </p>
            </div>
            
            {selectedFoodForDiary && (
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">Valori per {diaryGrams}g:</p>
                <div className="text-sm font-medium">
                  <p>{Math.round(selectedFoodForDiary.calories * diaryGrams / (selectedFoodForDiary.gramsPerServing || 100))} kcal</p>
                  <p className="text-xs text-muted-foreground">
                    P: {Math.round(selectedFoodForDiary.protein * diaryGrams / (selectedFoodForDiary.gramsPerServing || 100) * 10) / 10}g | 
                    C: {Math.round(selectedFoodForDiary.carbs * diaryGrams / (selectedFoodForDiary.gramsPerServing || 100) * 10) / 10}g | 
                    G: {Math.round(selectedFoodForDiary.fat * diaryGrams / (selectedFoodForDiary.gramsPerServing || 100) * 10) / 10}g
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDiaryDialogOpen(false)}
              data-testid="button-cancel-diary"
            >
              Annulla
            </Button>
            <Button
              onClick={handleConfirmAddToDiary}
              data-testid="button-confirm-add-diary"
            >
              Aggiungi al Diario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={barcodeScannerOpen} onOpenChange={(open) => {
        if (!open) {
          handleStopCamera();
        }
        setBarcodeScannerOpen(open);
        if (!open) {
          setBarcodeInput("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scansiona Codice a Barre</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cameraActive ? (
              <>
                <div 
                  id="qr-reader"
                  className="rounded-lg overflow-hidden bg-black qr-reader-container"
                  style={{ width: "100%", height: "300px" }}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Posiziona il codice a barre davanti alla fotocamera
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Codice a Barre (EAN/UPC)</label>
                <Input
                  type="text"
                  placeholder="Inserisci manualmente il codice..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleScanBarcode();
                    }
                  }}
                  data-testid="input-barcode"
                  disabled={isScanning || cameraActive}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Clicca su "Usa Fotocamera" oppure inserisci manualmente il codice EAN/UPC a 12-13 cifre.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleStopCamera();
                setBarcodeScannerOpen(false);
                setBarcodeInput("");
              }}
              disabled={isScanning}
              data-testid="button-cancel-barcode"
            >
              {cameraActive ? "Chiudi" : "Annulla"}
            </Button>
            
            {!cameraActive ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleStartCamera}
                  disabled={isScanning}
                  data-testid="button-use-camera"
                >
                  <Barcode className="w-4 h-4 mr-2" />
                  Usa Fotocamera
                </Button>
                <Button
                  onClick={handleScanBarcode}
                  disabled={isScanning || !barcodeInput.trim()}
                  data-testid="button-search-barcode"
                >
                  {isScanning ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Ricerca...
                    </>
                  ) : (
                    <>
                      <Barcode className="w-4 h-4 mr-2" />
                      Cerca
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStopCamera}
                disabled={isScanning}
              >
                <X className="w-4 h-4 mr-2" />
                Ferma
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
