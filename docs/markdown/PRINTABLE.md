# NutritionWise — Complete Documentation (Printable)

This single Markdown aggregates all functional and architecture documentation for convenient printing/export.

## How to Export to PDF (Windows)

1. Install Pandoc (one-time):
   - Winget: `winget install John MacFarlane.Pandoc`
   - Or download: https://pandoc.org/installing.html
2. Export:
   - `pandoc -s -o PRINTABLE.pdf PRINTABLE.md`

---

## Functional Documentation

### Homepage

- Source: docs/markdown/app/home.md
- Link: [Homepage](app/home.md)

### Tabs Overview

- Link: [Foods](app/tabs/foods/index.md)
- Link: [Meals](app/tabs/meals/index.md)
- Link: [Health](app/tabs/health/index.md)
- Link: [Shopping Lists](app/tabs/shopping-lists/index.md)
- Link: [Stats](app/tabs/stats/index.md)
- Link: [Settings](app/tabs/settings/index.md)

#### Foods Sections
- [Barcode Scanner](app/tabs/foods/sections/barcode-scanner.md)
- [Food List](app/tabs/foods/sections/food-list.md)
- [Add/Edit Food](app/tabs/foods/sections/add-edit-food.md)

#### Meals Sections
- [Meal Builder](app/tabs/meals/sections/meal-builder.md)
- [Diary](app/tabs/meals/sections/diary.md)

#### Health Sections
- [Water Reminders](app/tabs/health/sections/water-reminders.md)
- [Goals](app/tabs/health/sections/goals.md)

#### Shopping Lists Sections
- [Lists](app/tabs/shopping-lists/sections/lists.md)
- [Items](app/tabs/shopping-lists/sections/items.md)

#### Stats Sections
- [Charts](app/tabs/stats/sections/charts.md)

#### Settings Sections
- [Notifications](app/tabs/settings/sections/notifications.md)

---

## Architecture Documentation

- [Overview](architecture/index.md)
- [Frontend](architecture/frontend.md)
- [Mobile](architecture/mobile.md)
- [Build & Deploy](architecture/build-deploy.md)
- [Limitazioni](architecture/limitations.md)
- [Roadmap](architecture/roadmap.md)

---

## Notes

- This file provides consolidated navigation; follow links for detailed content.
- For a truly single-file export including content, use Pandoc with `--resource-path=docs/markdown` and the links will be resolvable in HTML/PDF outputs.
