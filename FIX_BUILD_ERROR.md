# 🔧 Fix Build Error - Barcode Scanner

## ❌ Errore Attuale

```
Rollup failed to resolve import "@zxing/library"
```

Il plugin `@capacitor-community/barcode-scanner` richiede dipendenze aggiuntive.

---

## ✅ Soluzione

### Esegui questi comandi nel terminale:

```powershell
# 1. Installa tutte le dipendenze necessarie
npm install @capacitor-community/barcode-scanner@4 @zxing/library @zxing/browser --legacy-peer-deps

# 2. Riprova il build
npm run build-client

# 3. Sincronizza con Android
npx cap sync android
```

---

## 📝 Note

- Ho aggiornato `vite.config.ts` per gestire meglio le dipendenze Capacitor
- `@zxing/library` e `@zxing/browser` sono richiesti dal barcode scanner community plugin
- Usa `--legacy-peer-deps` per evitare conflitti di versione

---

## 🔄 Se il problema persiste

```powershell
# Pulisci cache npm e node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm install @capacitor-community/barcode-scanner@4 @zxing/library @zxing/browser --legacy-peer-deps
npm run build-client
```

---

## ⚡ Quick Fix

```powershell
npm install @capacitor-community/barcode-scanner@4 @zxing/library @zxing/browser --legacy-peer-deps && npm run build-client && npx cap sync android
```

Esegui questo comando e il build dovrebbe funzionare!
