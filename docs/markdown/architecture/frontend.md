[Docs](../README.md) / [Architecture](index.md) / Frontend

## Section TOC
- [Overview](index.md)
- [Frontend](frontend.md)
- [Mobile](mobile.md)
- [Build & Deploy](build-deploy.md)
- [Limitazioni](limitations.md)
- [Roadmap](roadmap.md)

# Architettura · Frontend

## Stack
- React ^18.3.1 (TypeScript)
- Vite ^5.4.20
- Tailwind CSS ^3.4.17, shadcn/ui (Radix primitives)
- Stato: Zustand ^5.0.8 + TanStack Query ^5.60.5
- Routing: Wouter ^3.3.5
- Grafici: Recharts ^2.15.2

## PWA
- Manifest e Service Worker (`client/public/manifest.json`, `client/public/sw.js`)
- Offline first (dati locali)

## Build
- `npm run build-client` → output in `dist/public`

---
Back to top: [Architecture Overview](index.md) · [Docs Root](../README.md)
