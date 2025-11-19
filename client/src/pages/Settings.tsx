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
import { Save, Download, Upload, Trash2, Plus, Edit2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/languageContext";
import type { Language } from "@/lib/i18n";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const [settings, setSettings] = useState({
    itemsPerPage: 8,
    waterTargetMl: 2000,
    glassCapacityMl: 200,
    waterReminderEnabled: false,
    waterReminderIntervalMinutes: 120,
    waterReminderStartHour: 8,
    waterReminderEndHour: 20,
    calorieGoal: 2000,
    proteinGoal: 120,
    carbsGoal: 250,
    fatGoal: 65,
  });

  const [categories, setCategories] = useState([
    "Carboidrati",
    "Frutta",
    "Latticini",
    "Proteine",
    "Verdure",
  ]);

  const handleExportData = () => {
    const data = { settings, categories, /* other data */ };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutritrack-data.json';
    a.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          console.log('Import data:', data);
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
                  onClick={() => console.log('Edit category:', cat)}
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
            onClick={() => console.log('Add category')}
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
          onClick={() => console.log('Save settings:', settings)}
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-2" />
          {t.settings.saveSettings}
        </Button>
      </div>

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
              onClick={() => {
                console.log('Reset database');
                setShowResetDialog(false);
              }}
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
