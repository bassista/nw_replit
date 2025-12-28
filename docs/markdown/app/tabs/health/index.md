[Docs](../../README.md) / [App](../README.md) / Health

## Section TOC
- [Health Index](index.md)
- Sections: [Water Reminders](sections/water-reminders.md), [Goals](sections/goals.md)
- Other Tabs: [Foods](../foods/index.md), [Meals](../meals/index.md), [Shopping Lists](../shopping-lists/index.md), [Stats](../stats/index.md), [Settings](../settings/index.md)

# Tab: Salute

Parametri e promemoria salute.

## Funzionalità
- Promemoria acqua (notifiche native su Android)
- Obiettivi nutrizionali
- Calendario settimanale

## Componenti
- `WaterTracker`, `NutritionalGoalsCard`, `WeeklyCalendar`

## Notifiche
- `@capacitor/local-notifications` con ID int validi
- Permessi gestiti in `Settings` e hook `use-water-reminders`

## Design
- **Tracker acqua** con progressi e CTA in verde brand `#22c55e`
- **Obiettivi** su card `card-elevated`; testi secondari in `muted-foreground`
- **Calendario** con bordi sottili, selezioni evidenziate in primaria
- **Feedback**: toast non-bloccanti per azioni programmate/test

---
Back to top: [App Index](../README.md)
