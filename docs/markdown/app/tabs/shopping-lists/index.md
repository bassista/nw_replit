[Docs](../../README.md) / [App](../README.md) / Shopping Lists

## Section TOC
- [Shopping Lists Index](index.md)
- Sections: [Lists](sections/lists.md), [Items](sections/items.md)
- Other Tabs: [Foods](../foods/index.md), [Meals](../meals/index.md), [Health](../health/index.md), [Stats](../stats/index.md), [Settings](../settings/index.md)

# Tab: Liste della spesa

Gestione liste e articoli.

## Funzionalità
- Crea, modifica, elimina liste
- Aggiungi/rimuovi articoli
- Ordinamento e completamento

## Componenti
- `ShoppingListCard`

## Persistenza
- LocalStorage

## Design
- **Liste** su `card-filled`; elementi con stato "completato" in testo attenuato
- **Azioni** (aggiungi, elimina) in verde brand `#22c55e`; distruttive in rosso
- **Checkbox/Toggle** con stato attivo in primaria; area tap ampia
- **Spaziatura**: gruppi di elementi con separatori leggeri

---
Back to top: [App Index](../README.md)
