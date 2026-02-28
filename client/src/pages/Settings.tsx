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
import { Save, Download, Upload, Trash2, Plus, Edit2, ChevronDown, Info, Bell } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/languageContext";
import type { Language } from "@/lib/i18n";
import { loadSettings, saveSettings, loadCategories, saveCategories, exportAllData, importAllData, clearAllData, exportFoodsAsCSV, importFoodsFromCSV, saveFoods } from "@/lib/storage";
import { useAppStore } from "@/context/AppStore";
import { useToast } from "@/hooks/use-toast";
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from '@/lib/platform';
import { Filesystem, Directory } from '@capacitor/filesystem';

export default function Settings() {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState(loadSettings());
  const [categories, setCategories] = useState(loadCategories());
  const [openDataSection, setOpenDataSection] = useState(true);
  const [openGeneral, setOpenGeneral] = useState(true);
  const [openNutritional, setOpenNutritional] = useState(true);
  const [openCategories, setOpenCategories] = useState(true);
  const [openWater, setOpenWater] = useState(true);
  const [openReminders, setOpenReminders] = useState(true);

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
      const filename = `nutritrack-data-${new Date().toISOString().split('T')[0]}.json`;

      if (isNative()) {
        // On mobile (Android), save to Documents folder
        const result = await Filesystem.writeFile({
          path: filename,
          data: jsonData,
          directory: Directory.Documents,
          encoding: 'utf8' as any,
          recursive: true
        });
        toast({
          title: language === 'it' ? 'Esportazione completata' : 'Export successful',
          description: language === 'it' 
            ? `I tuoi dati sono stati salvati nei Documenti come ${result.uri ?? filename}` 
            : `Your data has been saved to the Documents folder as ${result.uri ?? filename}`,
        });
      } else {
        // On web, use standard download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: language === 'it' ? 'Esportazione completata' : 'Export successful',
          description: language === 'it' ? 'I tuoi dati sono stati esportati correttamente.' : 'Your data has been exported successfully.',
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('Error stack trace:', errorStack);
      // Show alert with full error for debugging on mobile
      alert(`Export Error:\n${errorMessage}\n\nStack:\n${errorStack}`);
      toast({
        title: language === 'it' ? 'Errore nell\'esportazione' : 'Export error',
        description: language === 'it' 
          ? `Si è verificato un errore: ${errorMessage}` 
          : `An error occurred: ${errorMessage}`,
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
      console.log('Starting to fetch all_foods.csv...');
      const response = await fetch('/all_foods.csv');
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV text length:', csvText.length);
      console.log('First 200 chars:', csvText.substring(0, 200));
      
      const foods = importFoodsFromCSV(csvText);
      console.log('Imported foods count:', foods.length);
      
      saveFoods(foods);
      console.log('Foods saved successfully');
      
      toast({
        title: language === 'it' ? 'Caricamento completato' : 'Load successful',
        description: language === 'it' ? `${foods.length} cibi sono stati caricati nell'app.` : `${foods.length} foods have been loaded into the app.`,
      });
    } catch (error) {
      console.error('Error loading default foods:', error);
      toast({
        title: language === 'it' ? 'Errore nel caricamento' : 'Load error',
        description: language === 'it' ? `Si è verificato un errore: ${error}` : `An error occurred: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleExportFoodsCSV = async () => {
    try {
      const csv = exportFoodsAsCSV();
      const filename = `nutritrack-foods-${new Date().toISOString().split('T')[0]}.csv`;

      if (isNative()) {
        // On mobile (Android), save to Documents folder
        const result = await Filesystem.writeFile({
          path: filename,
          data: csv,
          directory: Directory.Documents,
          encoding: 'utf8' as any,
          recursive: true
        });
        toast({
          title: language === 'it' ? 'Esportazione completata' : 'Export successful',
          description: language === 'it' 
            ? `I tuoi dati sono stati salvati nei Documenti come ${result.uri ?? filename}` 
            : `Your data has been saved to the Documents folder as ${result.uri ?? filename}`,
        });
      } else {
        // On web, use standard download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting foods:', error);
      toast({
        title: language === 'it' ? 'Errore nell\'esportazione' : 'Export error',
        description: language === 'it' ? 'Si è verificato un errore durante l\'esportazione dei cibi.' : 'An error occurred while exporting foods.',
        variant: "destructive",
      });
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

  const testNotification = async () => {
    if (isNative()) {
      try {
        // Controlla permessi
        let permStatus = await LocalNotifications.checkPermissions();
        
        if (permStatus.display !== 'granted') {
          // Richiedi permessi
          permStatus = await LocalNotifications.requestPermissions();
          
          if (permStatus.display !== 'granted') {
            toast({
              title: language === 'it' ? "Permessi negati" : "Permission denied",
              description: language === 'it' ? "Abilita i permessi notifiche nelle impostazioni" : "Enable notification permissions in settings",
              variant: "destructive"
            });
            return;
          }
        }

        // Invia notifica di test
        const notificationId = Math.floor(Math.random() * 2147483647);
        await LocalNotifications.schedule({
          notifications: [
            {
              title: '🧪 Test Notifica',
              body: language === 'it' ? 'Le notifiche funzionano correttamente!' : 'Notifications are working correctly!',
              id: notificationId,
              schedule: { at: new Date(Date.now() + 2000) },
              sound: undefined,
              attachments: undefined,
              actionTypeId: "",
              extra: null
            }
          ]
        });

        toast({
          title: language === 'it' ? "Notifica inviata" : "Notification sent",
          description: language === 'it' ? "Controlla le notifiche tra 2 secondi" : "Check notifications in 2 seconds"
        });
      } catch (error) {
        console.error('Error sending test notification:', error);
        toast({
          title: language === 'it' ? "Errore" : "Error",
          description: language === 'it' ? "Impossibile inviare notifica: " + error : "Cannot send notification: " + error,
          variant: "destructive"
        });
      }
    } else {
      // Web notification test
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🧪 Test Notifica', {
            body: language === 'it' ? 'Le notifiche funzionano correttamente!' : 'Notifications are working correctly!'
          });
          toast({
            title: language === 'it' ? "Notifica inviata" : "Notification sent",
            description: language === 'it' ? "Controlla le notifiche del browser" : "Check browser notifications"
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('🧪 Test Notifica', {
              body: language === 'it' ? 'Le notifiche funzionano correttamente!' : 'Notifications are working correctly!'
            });
            toast({
              title: language === 'it' ? "Notifica inviata" : "Notification sent",
              description: language === 'it' ? "Controlla le notifiche del browser" : "Check browser notifications"
            });
          }
        } else {
          toast({
            title: language === 'it' ? "Permessi negati" : "Permission denied",
            description: language === 'it' ? "Abilita i permessi notifiche nelle impostazioni del browser" : "Enable notification permissions in browser settings",
            variant: "destructive"
          });
        }
      }
    }
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
        <Collapsible open={openGeneral} onOpenChange={setOpenGeneral}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity">
                <h3 className="font-semibold text-foreground">{t.settings.general}</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${openGeneral ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4">
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
                  <Label>{t.settings.itemsPerPage}: {settings.itemsPerPage}</Label>
                  <Slider
                    value={[settings.itemsPerPage]}
                    onValueChange={(value: number[]) => setSettings({ ...settings, itemsPerPage: value[0] })}
                    min={2}
                    max={48}
                    step={2}
                    data-testid="slider-items-per-page"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2</span>
                    <span>48</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Nutritional Goals */}
        <Collapsible open={openNutritional} onOpenChange={setOpenNutritional}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity mb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t.settings.nutritionalGoalsTitle}</h3>
                  <p className="text-sm text-muted-foreground">{t.settings.nutritionalGoalsDescription}</p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ml-2 ${openNutritional ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Categories Management */}
        <Collapsible open={openCategories} onOpenChange={setOpenCategories}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity mb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t.settings.categories}</h3>
                  <p className="text-sm text-muted-foreground">{t.settings.categoriesDescription}</p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ml-2 ${openCategories ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Water Settings */}
        <Collapsible open={openWater} onOpenChange={setOpenWater}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity mb-4">
                <h3 className="font-semibold text-foreground">{t.settings.hydrationSettings}</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${openWater ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Reminder Settings */}
        <Collapsible open={openReminders} onOpenChange={setOpenReminders}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity mb-4">
                <h3 className="font-semibold text-foreground">{t.settings.waterReminders}</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${openReminders ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
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

                <div className="pt-4 border-t">
                  <Button onClick={testNotification} variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    {language === 'it' ? 'Test Notifica' : 'Test Notification'}
                  </Button>
                </div>
              </>
            )}
          </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Data Management */}
        <Collapsible open={openDataSection} onOpenChange={setOpenDataSection}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity">
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{language === 'it' ? 'Importa i tuoi dati alimentari o ripristina l\'applicazione.' : 'Import your food data or restore the application.'}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openDataSection ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4 space-y-4">
              {/* Dati Alimenti di Base */}
              <div className="border-t border-card-border pt-4">
                <h4 className="font-semibold text-foreground mb-2">{language === 'it' ? 'Dati Alimenti di Base' : 'Basic Foods Data'}</h4>
                <p className="text-sm text-muted-foreground mb-3">{language === 'it' ? 'Carica una lista predefinita di alimenti nell\'app.' : 'Load a predefined list of foods into the app.'}</p>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white w-auto"
                  onClick={handleLoadDefaultFoods}
                  data-testid="button-load-default-foods"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'it' ? 'Carica' : 'Load'}
                </Button>
              </div>

              {/* Dati Alimenti CSV */}
              <div className="border-t border-card-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{language === 'it' ? 'Dati Alimenti CSV' : 'Foods CSV Data'}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {language === 'it' ? 'Importa o scarica i tuoi dati alimentari in formato CSV' : 'Import or download your food data in CSV format'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{language === 'it' ? 'Carica o scarica un file CSV con i tuoi dati alimentari.' : 'Upload or download a CSV file with your food data.'}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleImportFoodsCSV}
                    data-testid="button-import-foods-csv"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'it' ? 'Importa da CSV' : 'Import from CSV'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportFoodsCSV}
                    data-testid="button-export-foods-csv"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'it' ? 'Scarica in CSV' : 'Export to CSV'}
                  </Button>
                </div>
              </div>

              {/* Backup e Ripristino */}
              <div className="border-t border-card-border pt-4">
                <h4 className="font-semibold text-foreground mb-2">{language === 'it' ? 'Backup e Ripristino' : 'Backup & Restore'}</h4>
                <p className="text-sm text-muted-foreground mb-3">{language === 'it' ? 'Scarica tutti i tuoi dati su un file o ripristinali da un backup.' : 'Download all your data to a file or restore from a backup.'}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    data-testid="button-export"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'it' ? 'Scarica Dati' : 'Download Data'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportData}
                    data-testid="button-import"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'it' ? 'Carica da Backup' : 'Restore Backup'}
                  </Button>
                </div>
              </div>

              {/* Zona di Pericolo */}
              <div className="border-t border-card-border pt-4">
                <h4 className="font-semibold text-red-600 mb-3">{language === 'it' ? 'Zona di pericolo' : 'Danger Zone'}</h4>
                <Button
                  variant="destructive"
                  className="w-auto"
                  onClick={() => setShowResetDialog(true)}
                  data-testid="button-reset"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'it' ? 'Cancella tutti i dati' : 'Delete all data'}
                </Button>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
