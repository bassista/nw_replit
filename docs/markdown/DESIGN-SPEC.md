# NutritionWise · Design Specification

This document defines Branding, Colors, Layouts, and Look & Feel for NutritionWise, aligned with the existing codebase and UI libraries.

## Branding
- **Product name**: NutritionWise
- **Tone & personality**: Friendly, practical, reassuring. Emphasis on health, clarity, and simplicity.
- **Iconography**: Lucide icons (outlined, clean). Prefer food, health, water, calendar motifs.
- **Primary brand color**: Green — `hsl(142 71% 45%)` (hex approx `#22c55e`). Used for CTAs, status bar, highlights, and notification accent.
- **App icon & splash**:
  - Android adaptive icons: foreground glyph on green or white background; avoid dense details.
  - Splash screen background: brand green with light content; spinner off; quick transition.
- **Voice & copy**: Short labels, positive reinforcement, clear actions (e.g., "Scansiona Codice", "Aggiungi Pasto").

## Colors
Color tokens are defined in `client/src/index.css` via CSS variables, with light/dark sets.

### Core palette (Light)
- **Background**: `hsl(0 0% 100%)`
- **Foreground**: `hsl(0 0% 9%)`
- **Border**: `hsl(0 0% 89%)`
- **Card**: `hsl(0 0% 98%)` with `card-border: hsl(0 0% 94%)`
- **Primary**: `hsl(142 71% 45%)` (brand/CTA)
- **Secondary**: `hsl(0 0% 92%)`
- **Muted**: `hsl(0 0% 93%)` / `muted-foreground: hsl(0 0% 40%)`
- **Accent**: `hsl(142 18% 92%)` / `accent-foreground: hsl(142 18% 9%)`
- **Destructive**: `hsl(0 84% 40%)` / `destructive-foreground: hsl(0 84% 98%)`
- **Ring**: `hsl(142 76% 36%)` (focus rings)

### Core palette (Dark)
- **Background**: `hsl(0 0% 9%)`
- **Foreground**: `hsl(0 0% 98%)`
- **Border**: `hsl(0 0% 18%)`
- **Card**: `hsl(0 0% 11%)` with `card-border: hsl(0 0% 14%)`
- **Primary**: same hue/value; ensure AA contrast vs background
- **Muted**: `hsl(0 0% 18%)` / `muted-foreground: hsl(0 0% 65%)`
- **Accent**: `hsl(142 18% 17%)`
- **Destructive**: `hsl(0 84% 35%)`

### Usage guidelines
- **Primary**: buttons, active states, charts emphasis.
- **Accent**: badges, subtle highlights.
- **Muted**: supporting surfaces and subtext.
- **Destructive**: irreversible actions, error toasts.
- **Borders**: use subtle borders for separation; avoid heavy outlines.
- Maintain contrast (WCAG AA) for text and interactive elements.

## Typography
- **Fonts**: Inter (sans) — declared as `--font-sans` in CSS; optional system fallback.
- **Scale**: Base 16px; sizes via Tailwind utilities.
- **Weight & tracking**: Regular to semibold; `--tracking-normal: 0em` for neutral spacing.
- **Headings**: concise, sentence case; avoid ALL CAPS.

## Layouts
- **Navigation**: Bottom tab bar on mobile. Primary tabs: Home, Cibi, Pasti, Salute, Liste, Statistiche, Impostazioni.
- **Cards**: Material-inspired surfaces. Use `card-elevated`, `card-filled`, `card-outlined` according to context.
- **Spacing**: Base spacing `--spacing: 0.25rem`; group content with consistent vertical rhythm.
- **Radius**: `--radius: .5rem` for controls and cards; remain consistent.
- **Elevation & shadows**: Subtle layers (`--shadow-*` tokens) for hover/active feedback.
- **Dialogs**: shadcn/ui modals for forms and confirmations; limit to focused tasks.
- **Forms**: clear labels, inline validation; use `Input`, `Select`, `Slider` from shadcn/ui.
- **Scanner overlay**:
  - Fullscreen overlay activated via `body.scanner-active`.
  - Viewfinder box ~280px, 3px green border, rounded corners; dimmed backdrop.
  - Only a bottom-center "Annulla" button; app content is hidden during scan.

## Look & Feel
- **Style**: Clean, modern, approachable. Material influence with shadcn/ui primitives.
- **Interactions**: Direct and predictable; quick feedback via toasts and subtle motion.
- **Motion**:
  - Subtle animations only (`pulse-subtle`, `slide-up`, `bounce-subtle` keyframes).
  - Prefer micro-interactions; avoid long transitions.
- **Feedback**: Toasts for actions; non-blocking inline errors.
- **Icons**: Lucide, 16–24px; sufficient tappable area on mobile.

## Accessibility & Mobile
- **Contrast**: Ensure AA contrast for text and buttons (especially primary on background).
- **Tap targets**: Minimum 44×44px on mobile.
- **System behaviors**: Support Android back button semantics; avoid accidental exits.
- **Permissions**: Clear prompts for camera and notifications; fail gracefully.

## Theming
- **Light/Dark**: Dual theme via `.dark` class in CSS; tokens provide full palette swap.
- **Status bar**: Light content with brand background on Android for coherence.

## Components & Libraries
- **UI**: shadcn/ui (Radix UI primitives) with Tailwind utilities.
- **State**: Zustand; server state via TanStack Query.
- **Charts**: Recharts; keep color mapping consistent with brand.
- **Icons**: lucide-react.

## References
- Styles: [client/src/index.css](../../client/src/index.css)
- Pages & components: [client/src/pages](../../client/src/pages), [client/src/components](../../client/src/components)
- Hooks: [client/src/hooks](../../client/src/hooks)
