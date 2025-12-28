[Docs](../README.md) / [Architecture](index.md) / Build & Deploy

## Section TOC
- [Overview](index.md)
- [Frontend](frontend.md)
- [Mobile](mobile.md)
- [Build & Deploy](build-deploy.md)
- [Limitazioni](limitations.md)
- [Roadmap](roadmap.md)

# Architettura · Build & Deploy

## Frontend
- Build: `npm run build-client` (Vite)
- Output: `dist/public`

## Mobile Android
- `npm run android:build` → debug APK
- `npm run android:build:release` → release APK/AAB (keystore non versionato)
- `npx cap open android` per Android Studio

## Backend
- Build Node: `npm run build` (esbuild)
- Avvio: `npm start`

## CI/CD (ipotesi)
- GitHub Actions per build e release Android
- Vercel/Netlify per PWA

---
Back to top: [Architecture Overview](index.md) · [Docs Root](../README.md)
