[Docs](../README.md) / Architecture

## Section TOC
- [Overview](index.md)
- [Frontend](frontend.md)
- [Mobile](mobile.md)
- [Build & Deploy](build-deploy.md)
- [Limitazioni](limitations.md)
- [Roadmap](roadmap.md)

# Architettura · Panoramica

Applicazione React (PWA) con estensioni native via Capacitor per Android. Backend preparato ma opzionale.

## Layer
- Frontend: React + Vite + Tailwind + shadcn/ui
- Mobile: Capacitor (Local Notifications, Barcode Scanner)
- Storage: LocalStorage (adapter pattern)
- Backend (opzionale): Express + Drizzle ORM + Neon (PostgreSQL)

## Comunicazione
- Attuale: locale (no sync cloud)
- Futuro: API REST su `server/` con persistenza Neon

---
Back to top: [Docs Root](../README.md)
