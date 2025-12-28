[Docs](../../../README.md) / [App](../../README.md) / [Health](../index.md) / Water Reminders

## Section TOC
- [Health Index](../index.md)
- Sections: [Water Reminders](water-reminders.md), [Goals](goals.md)

# Salute · Promemoria Acqua

## Funzioni
- Pianificazione notifiche a intervalli
- Test notifica da `Settings`

## Implementazione
- Hook: `client/src/hooks/use-water-reminders.ts`
- ID notifica: `Math.floor(Math.random() * 2147483647)`
- Permessi: richiesta e verifica prima della schedulazione

---
Back to top: [Health Index](../index.md) · [App Index](../../README.md)
