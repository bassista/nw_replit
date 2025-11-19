import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    itemsPerPage: 8,
    waterTargetMl: 2000,
    glassCapacityMl: 200,
    waterReminderEnabled: false,
    waterReminderIntervalMinutes: 120,
    waterReminderStartHour: 8,
    waterReminderEndHour: 20,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Impostazioni"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* General Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Generali</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="items-per-page">Cibi per pagina</Label>
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

        {/* Water Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Idratazione</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="water-target">Obiettivo giornaliero (ml)</Label>
              <Input
                id="water-target"
                type="number"
                value={settings.waterTargetMl}
                onChange={(e) => setSettings({ ...settings, waterTargetMl: parseInt(e.target.value) })}
                data-testid="input-water-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="glass-capacity">Capacità bicchiere (ml)</Label>
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
          <h3 className="font-semibold text-foreground mb-4">Promemoria Acqua</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-enabled">Abilita promemoria</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi notifiche per bere acqua
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
                  <Label htmlFor="reminder-interval">Intervallo (minuti)</Label>
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
                    <Label htmlFor="start-hour">Ora inizio</Label>
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
                    <Label htmlFor="end-hour">Ora fine</Label>
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

        {/* Save Button */}
        <Button
          className="w-full"
          onClick={() => console.log('Save settings:', settings)}
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-2" />
          Salva Impostazioni
        </Button>
      </div>
    </div>
  );
}
