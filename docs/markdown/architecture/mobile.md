[Docs](../README.md) / [Architecture](index.md) / Mobile

## Section TOC
- [Overview](index.md)
- [Frontend](frontend.md)
- [Mobile](mobile.md)
- [Build & Deploy](build-deploy.md)
- [Limitazioni](limitations.md)
- [Roadmap](roadmap.md)

# Architettura · Mobile (Capacitor)

## Plugin
- `@capacitor/local-notifications` ^5.0.8
- `@capacitor-community/barcode-scanner` ^4.0.1
- `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/app`, `@capacitor/device`

## Android
- Permessi: CAMERA, POST_NOTIFICATIONS, VIBRATE, RECEIVE_BOOT_COMPLETED
- Build: `npm run android:build` / `android:build:release`
- Sincronizzazione: `npx cap sync android`

## UX scanner
- Overlay CSS e chiusura Dialog durante scansione
- Retro-camera forzata

---
Back to top: [Architecture Overview](index.md) · [Docs Root](../README.md)
