# Design Guidelines: Nutrition & Meal Planning Mobile App

## Design Approach
**System-Based Design** with inspiration from modern health tracking apps (MyFitnessPal, Lose It) combined with Material Design principles for mobile-first experience. Focus on data clarity, quick interactions, and thumb-friendly navigation.

## Core Design Principles
- **Mobile-First**: Primary viewport is smartphone (375px-428px width)
- **Thumb Zone Optimization**: Critical actions within bottom 60% of screen
- **Quick Actions**: One-tap interactions for common tasks (add water, check off items)
- **Data Density**: Information-rich cards without overwhelming users
- **Gestural Navigation**: Swipe, drag-drop, pull-to-refresh patterns

## Typography System

**Font Family**: Inter (Google Fonts) for excellent readability at small sizes
- **Display/Headers**: 600-700 weight, 24px-32px
- **Section Titles**: 600 weight, 18px-20px  
- **Body Text**: 400-500 weight, 15px-16px
- **Labels/Meta**: 500 weight, 13px-14px
- **Nutritional Values**: 600-700 weight, 14px-16px (tabular numbers)

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 (16px)
- Section spacing: gap-4 to gap-6
- Card margins: m-4
- Bottom nav height: h-16

**Container Strategy**:
- Mobile: Full-width with px-4 side padding
- Content max-width: max-w-2xl centered for tablet/desktop
- Safe areas: pb-20 to account for bottom navigation

## Navigation Architecture

**Bottom Tab Bar** (Fixed, always visible):
- 5 primary sections: Home/Diary, Foods, Meals, Stats, Settings
- Icon + label (small text below icon)
- Active state: Bold icon, accent indicator
- Height: 64px with safe area padding
- Icons: Heroicons (outline for inactive, solid for active)

**Top App Bar**:
- Logo/title left, action buttons right (search, add, menu)
- Height: 56px
- Sticky on scroll

## Component Library

### Food Item Cards
- Compact horizontal layout: Image thumbnail (48px) | Name + brief nutrition | Action button
- Expanded view: Full nutritional breakdown in grid (2-column on mobile)
- Search bar: Sticky below top bar, rounded with icon prefix

### Meal Builder
- Selected foods list with quantity inputs (inline spinners)
- Real-time nutritional totals in sticky footer above bottom nav
- Add food: Full-screen modal with search

### Diary Entries
- Daily view: Sections for meal types (Breakfast, Lunch, Dinner, Snacks)
- Each section: Collapsible accordion with meal name, total calories, + button
- Calendar navigation: Horizontal date picker (swipeable week view)

### Water Tracker
- Large circular progress ring showing ml consumed / target
- Single prominent "Add Glass" button (tap to increment)
- Quick stats: Glasses consumed, time since last drink

### Progress Bars
- Nutritional goals: Horizontal bars with segments (protein/carbs/fats different visual weight)
- Labels: Goal name left, Current/Target right
- Visual feedback: Color intensity increases as goal approached

### Shopping Lists
- Card-per-list with item count badge
- List items: Checkbox + item name + swipe-to-delete
- Checked items: Strikethrough with reduced opacity
- Floating "Add" button (bottom-right corner)

### Calendar (Weekly Meal Plan)
- 7-day grid view (Monday-Sunday)
- Each day: Large card showing assigned meal (or empty state)
- Drag-drop: Long-press meal card to drag onto calendar day
- Visual feedback: Drop zones with dashed borders

### Charts & Statistics
- Card-based layout (one chart per card)
- Chart types: Donut (macro distribution), Line (calorie trends), Bar (weekly comparison)
- Time period selector: Tabs (Day/Week/Month)
- Legend: Inline with clear labels

### Gamification Elements
- Badge grid: Icon + title + progress (locked/unlocked state)
- Achievement notifications: Toast from top with celebration icon
- Daily score: Large letter grade (A+ to F) with brief explanation

### Forms & Inputs
- Floating label pattern for text inputs
- Number spinners for quantities (- / value / + buttons)
- Dropdowns: Native select styled with custom arrow
- CSV upload: Drag-drop zone with file browser fallback

### Settings Screen
- Grouped sections with dividers
- Toggle switches for boolean options
- Number inputs with increment/decrement buttons
- Time pickers: Native mobile time selector

## Interaction Patterns

- **Tap**: Primary actions (add item, select food)
- **Long-press**: Secondary actions (drag to reorder, context menu)
- **Swipe**: Navigate dates, delete list items
- **Pull-down**: Refresh data
- **Drag-drop**: Assign meals to calendar

## Empty States
- Friendly illustrations (food-themed line drawings)
- Clear call-to-action button
- Helper text explaining next steps

## Data Visualization
- Use Victory Native or Recharts for responsive charts
- Consistent axis labels and grid lines
- Touch-friendly chart interactions (tap for details)

## Images
No hero images required. This is a utility app focused on data and functionality. Use icons and illustrations for:
- Empty states (centered, 120px-160px illustrations)
- Food placeholders (generic food icon)
- Achievement badges (colorful icons)

**Critical Mobile Optimizations**:
- All interactive elements minimum 44px touch target
- Bottom navigation always accessible (fixed position)
- Forms: One field per row for easy thumb typing
- Sticky elements: Search bars, nutritional totals during meal building
- Modals: Full-screen on mobile for complex interactions (meal builder, food search)