import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Save, Download, Upload, Trash2, Plus, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/languageContext";
import type { Language } from "@/lib/i18n";
import { loadSettings, saveSettings, loadCategories, saveCategories, exportAllData, importAllData, clearAllData, exportFoodsAsCSV, importFoodsFromCSV, saveFoods } from "@/lib/storage";
import { useAppStore } from "@/context/AppStore";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState(loadSettings());
  const [categories, setCategories] = useState(loadCategories());

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Save categories when they change
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const handleExportData = async () => {
    try {
      const jsonData = await exportAllData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutritrack-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: language === 'it' ? 'Esportazione completata' : 'Export successful',
        description: language === 'it' ? 'I tuoi dati sono stati esportati correttamente.' : 'Your data has been exported successfully.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: language === 'it' ? 'Errore nell\'esportazione' : 'Export error',
        description: language === 'it' ? 'Si è verificato un errore durante l\'esportazione dei dati.' : 'An error occurred during data export.',
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string;
          await importAllData(jsonString);
          // Force immediate save to localStorage before reload
          await useAppStore.getState().saveState();
          toast({
            title: language === 'it' ? 'Importazione completata' : 'Import successful',
            description: language === 'it' ? 'I tuoi dati sono stati ripristinati. Pagina ricaricata.' : 'Your data has been restored. Page reloaded.',
          });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error('Error importing data:', error);
          toast({
            title: language === 'it' ? 'Errore nell\'importazione' : 'Import error',
            description: language === 'it' ? 'Si è verificato un errore durante l\'importazione dei dati.' : 'An error occurred during data import.',
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetDatabase = () => {
    clearAllData();
    window.location.reload();
  };

  const handleLoadDefaultFoods = async () => {
    try {
      const response = await fetch('/all_foods.csv');
      const csvText = await response.text();
      await importFoodsFromCSV(csvText);
      toast({
        title: language === 'it' ? 'Caricamento completato' : 'Load successful',
        description: language === 'it' ? 'I cibi sono stati caricati nell\'app.' : 'Foods have been loaded into the app.',
      });
    } catch (error) {
      console.error('Error loading default foods:', error);
      toast({
        title: language === 'it' ? 'Errore nel caricamento' : 'Load error',
        description: language === 'it' ? 'Si è verificato un errore durante il caricamento dei cibi.' : 'An error occurred while loading foods.',
        variant: "destructive",
      });
    }
  };

  const handleExportFoodsCSV = () => {
    try {
      const csv = exportFoodsAsCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutritrack-foods-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting foods:', error);
      alert(language === 'it' ? 'Errore nell\'esportazione dei cibi' : 'Error exporting foods');
    }
  };

  const handleImportFoodsCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csvContent = event.target?.result as string;
          const foods = importFoodsFromCSV(csvContent);
          if (foods.length === 0) {
            toast({
              title: language === 'it' ? 'Nessun alimento trovato' : 'No foods found',
              description: language === 'it' ? 'Il file CSV non contiene alimenti validi.' : 'The CSV file does not contain valid foods.',
              variant: "destructive",
            });
            return;
          }
          saveFoods(foods);
          // Force immediate save to localStorage before reload
          await useAppStore.getState().saveState();
          toast({
            title: language === 'it' ? 'Importazione completata' : 'Import successful',
            description: language === 'it' ? `${foods.length} ${foods.length === 1 ? 'alimento' : 'alimenti'} importati con successo.` : `${foods.length} ${foods.length === 1 ? 'food' : 'foods'} imported successfully.`,
          });
          window.location.reload();
        } catch (error) {
          console.error('Error importing foods:', error);
          toast({
            title: language === 'it' ? 'Errore nell\'importazione' : 'Import error',
            description: language === 'it' ? 'Si è verificato un errore durante il caricamento del file CSV.' : 'An error occurred while importing the CSV file.',
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      if (editingCategoryIndex !== null) {
        // Edit mode
        const updatedCategories = [...categories];
        updatedCategories[editingCategoryIndex] = newCategoryName.trim();
        setCategories(updatedCategories);
      } else {
        // Add mode
        setCategories([...categories, newCategoryName.trim()]);
      }
      setNewCategoryName('');
      setEditingCategoryIndex(null);
      setShowCategoryDialog(false);
    }
  };

  const handleEditCategory = (idx: number) => {
    setEditingCategoryIndex(idx);
    setNewCategoryName(categories[idx]);
    setShowCategoryDialog(true);
  };

  const handleOpenAddDialog = () => {
    setEditingCategoryIndex(null);
    setNewCategoryName('');
    setShowCategoryDialog(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={t.settings.title}
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* General Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">{t.settings.general}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t.settings.language}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="items-per-page">{t.settings.itemsPerPage}</Label>
              <Input
                id="items-per-page"
                type="number"
                value={settings.itemsPerPage}
                onChange={(e) => setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) })}
                data-testid="input-items-per-page"
              />
            </div>
          </div>
        </Card>

        {/* Nutritional Goals */}
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">{t.settings.nutritionalGoalsTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.settings.nutritionalGoalsDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calorie-goal">{t.foods.calories} (kcal)</Label>
              <Input
                id="calorie-goal"
                type="number"
                value={settings.calorieGoal}
                onChange={(e) => setSettings({ ...settings, calorieGoal: parseInt(e.target.value) })}
                data-testid="input-calorie-goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein-goal">{t.foods.protein} (g)</Label>
              <Input
                id="protein-goal"
                type="number"
                value={settings.proteinGoal}
                onChange={(e) => setSettings({ ...settings, proteinGoal: parseInt(e.target.value) })}
                data-testid="input-protein-goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs-goal">{t.foods.carbs} (g)</Label>
              <Input
                id="carbs-goal"
                type="number"
                value={settings.carbsGoal}
                onChange={(e) => setSettings({ ...settings, carbsGoal: parseInt(e.target.value) })}
                data-testid="input-carbs-goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat-goal">{t.foods.fat} (g)</Label>
              <Input
                id="fat-goal"
                type="number"
                value={settings.fatGoal}
                onChange={(e) => setSettings({ ...settings, fatGoal: parseInt(e.target.value) })}
                data-testid="input-fat-goal"
              />
            </div>
          </div>
        </Card>

        {/* Categories Management */}
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">{t.settings.categories}</h3>
            <p className="text-sm text-muted-foreground">{t.settings.categoriesDescription}</p>
          </div>
          <div className="space-y-2 mb-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="secondary" className="flex-1">{cat}</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditCategory(idx)}
                  data-testid={`button-edit-category-${idx}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setCategories(prev => prev.filter((_, i) => i !== idx))}
                  data-testid={`button-delete-category-${idx}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleOpenAddDialog}
            data-testid="button-add-category"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.settings.addCategory}
          </Button>
        </Card>

        {/* Water Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">{t.settings.hydrationSettings}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="water-target">{t.settings.dailyTarget}</Label>
              <Input
                id="water-target"
                type="number"
                value={settings.waterTargetMl}
                onChange={(e) => setSettings({ ...settings, waterTargetMl: parseInt(e.target.value) })}
                data-testid="input-water-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="glass-capacity">{t.settings.glassCapacity}</Label>
              <Input
                id="glass-capacity"
                type="number"
                value={settings.glassCapacityMl}
                onChange={(e) => setSettings({ ...settings, glassCapacityMl: parseInt(e.target.value) })}
                data-testid="input-glass-capacity"
              />
            </div>
          </div>
        </Card>

        {/* Reminder Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">{t.settings.waterReminders}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-enabled">{t.settings.enableReminders}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.reminderDescription}
                </p>
              </div>
              <Switch
                id="reminder-enabled"
                checked={settings.waterReminderEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, waterReminderEnabled: checked })}
                data-testid="switch-reminder"
              />
            </div>

            {settings.waterReminderEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reminder-interval">{t.settings.interval}</Label>
                  <Input
                    id="reminder-interval"
                    type="number"
                    value={settings.waterReminderIntervalMinutes}
                    onChange={(e) => setSettings({ ...settings, waterReminderIntervalMinutes: parseInt(e.target.value) })}
                    data-testid="input-reminder-interval"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-hour">{t.settings.startHour}</Label>
                    <Input
                      id="start-hour"
                      type="number"
                      min="0"
                      max="23"
                      value={settings.waterReminderStartHour}
                      onChange={(e) => setSettings({ ...settings, waterReminderStartHour: parseInt(e.target.value) })}
                      data-testid="input-start-hour"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-hour">{t.settings.endHour}</Label>
                    <Input
                      id="end-hour"
                      type="number"
                      min="0"
                      max="23"
                      value={settings.waterReminderEndHour}
                      onChange={(e) => setSettings({ ...settings, waterReminderEndHour: parseInt(e.target.value) })}
                      data-testid="input-end-hour"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">{t.settings.dataManagement}</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportData}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              {t.settings.exportData}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleImportData}
              data-testid="button-import"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t.settings.importData}
            </Button>

            <div className="border-t border-card-border my-3"></div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportFoodsCSV}
              data-testid="button-export-foods-csv"
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'it' ? 'Scarica Cibi (CSV)' : 'Download Foods (CSV)'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleImportFoodsCSV}
              data-testid="button-import-foods-csv"
            >
              <Upload className="w-4 h-4 mr-2" />
              {language === 'it' ? 'Carica Cibi (CSV)' : 'Upload Foods (CSV)'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadDefaultFoods}
              data-testid="button-load-default-foods"
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'it' ? 'Carica Cibi Predefiniti' : 'Load Default Foods'}
            </Button>

            <div className="border-t border-card-border my-3"></div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowResetDialog(true)}
              data-testid="button-reset"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t.settings.resetDatabase}
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full"
          onClick={() => {
            saveSettings(settings);
            saveCategories(categories);
          }}
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-2" />
          {t.settings.saveSettings}
        </Button>
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryIndex !== null ? 'Modifica Categoria' : 'Aggiungi Categoria'}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome categoria..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            data-testid="input-category-name"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Annulla
            </Button>
            <Button
              onClick={handleAddCategory}
              data-testid="button-confirm-category"
              disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
            >
              {editingCategoryIndex !== null ? 'Modifica' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.settings.resetDatabase}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.settings.resetWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.foods.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDatabase}
              className="bg-destructive text-destructive-foreground"
            >
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
