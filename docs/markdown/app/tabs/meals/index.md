[Docs](../../README.md) / [App](../README.md) / Meals

## Section TOC
- [Meals Index](index.md)
- Sections: [Meal Builder](sections/meal-builder.md), [Diary](sections/diary.md)
- Other Tabs: [Foods](../foods/index.md), [Health](../health/index.md), [Shopping Lists](../shopping-lists/index.md), [Stats](../stats/index.md), [Settings](../settings/index.md)

# Tab: Pasti

Composizione pasti e diario.

## Funzionalità
- Crea/Modifica pasti con quantità
- Calcolo punteggio/score del pasto
- Aggiunta al diario

## Componenti
- `MealCard`, `MealScoreCard`, `DiarySection`

## Flussi
- Seleziona cibo → imposta grammi → aggiungi a pasto
- Salva pasto → aggiungi al diario

## Design
- **CTA** (Aggiungi al diario, Salva) in verde brand `#22c55e`
- **Card pasti** con `card-filled`; punteggio su `MealScoreCard` con enfasi primaria
- **Motion**: aggiornamenti punteggio/macronutrienti con animazioni sottili
- **Icone**: lucide per azioni; area tap ≥ 44×44px

---
Back to top: [App Index](../README.md)
