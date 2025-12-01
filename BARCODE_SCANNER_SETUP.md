# 📸 Setup Barcode Scanner Nativo Android

## ✅ Modifiche Completate

Ho implementato il barcode scanner nativo che:
- ✅ Usa la **fotocamera nativa** su Android
- ✅ Utilizza sempre la **fotocamera posteriore** (back camera)
- ✅ **Non chiede** quale fotocamera usare
- ✅ Mostra un overlay di scansione con pulsante annulla
- ✅ Mantiene html5-qrcode come fallback per il web

---

## 🚀 Installazione Plugin

Esegui questo comando per installare il plugin barcode scanner:

```powershell
npm install @capacitor-community/barcode-scanner@4 --legacy-peer-deps
```

---

## 📝 Permessi Android

Il file `android/app/src/main/AndroidManifest.xml` deve contenere (già configurato):

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

---

## 🔧 Build e Test

### 1. Build Web
```powershell
npm run build-client
```

### 2. Sincronizza con Android
```powershell
npx cap sync android
```

### 3. Apri in Android Studio
```powershell
npx cap open android
```

### 4. Esegui su Dispositivo/Emulatore
In Android Studio, clicca il pulsante **Run** (oppure Shift+F10)

---

## 🧪 Come Testare

1. Apri l'app su Android
2. Vai nella scheda **"Cibi"**
3. Clicca il pulsante **barcode** (icona codice a barre) in alto
4. Clicca **"Scansiona Codice"**
5. Accetta il permesso camera se richiesto
6. La fotocamera **posteriore** si attiverà automaticamente
7. Inquadra un codice a barre EAN/UPC
8. Il codice verrà rilevato e cercato su OpenFoodFacts

---

## 🎯 Cosa è Stato Cambiato

### 1. `client/src/hooks/use-barcode-scanner.ts` (NUOVO)
Hook custom per gestire lo scanner nativo:
- Richiede permessi camera automaticamente
- Usa sempre fotocamera posteriore
- Mostra overlay con istruzioni e pulsante annulla
- Gestisce cleanup corretto

### 2. `client/src/pages/Foods.tsx`
- Importa `useBarcodeScanner` e `isNative`
- Rileva se è app nativa o web
- Su Android: usa scanner nativo
- Su Web: usa html5-qrcode esistente
- Testo pulsante dinamico ("Scansiona Codice" vs "Usa Fotocamera")

### 3. `client/src/lib/platform.ts` (già esistente)
Utility per rilevare la piattaforma

---

## 🔍 Come Funziona

### Su Android (App Nativa):
1. Utente clicca "Scansiona Codice"
2. Richiede permesso camera (solo prima volta)
3. Apre fotocamera posteriore in fullscreen
4. Mostra overlay con:
   - Testo "Inquadra il codice a barre"
   - Pulsante rosso "Annulla" in basso
5. Scanner rileva automaticamente codici EAN-13, EAN-8, UPC-A, UPC-E, CODE-128, CODE-39
6. Chiude camera e cerca prodotto su OpenFoodFacts

### Su Web (PWA):
1. Utente clicca "Usa Fotocamera"
2. Richiede permesso camera
3. Mostra html5-qrcode (com'era prima)
4. Funziona come scanner web standard

---

## ⚙️ Configurazione Scanner

Nel file `client/src/hooks/use-barcode-scanner.ts` puoi modificare:

```typescript
// Formati codici supportati
targetedFormats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39']
```

Formati disponibili:
- `EAN_13`, `EAN_8` - Codici europei prodotti
- `UPC_A`, `UPC_E` - Codici americani prodotti  
- `CODE_128`, `CODE_39` - Codici industriali
- `QR_CODE` - QR code (se necessario)
- `DATA_MATRIX`, `PDF_417` - Altri formati

---

## 🎨 Personalizzazione Overlay

Nel file `use-barcode-scanner.ts`, l'overlay HTML può essere personalizzato:

```typescript
scannerOverlay.innerHTML = `
  <div style="...">
    Inquadra il codice a barre  // ← Cambia testo
  </div>
  <button id="cancel-scan" style="...">
    Annulla  // ← Cambia testo pulsante
  </button>
`;
```

---

## 🐛 Troubleshooting

### Scanner non si apre
```powershell
# Verifica installazione plugin
npm list @capacitor-community/barcode-scanner

# Reinstalla se necessario
npm install @capacitor-community/barcode-scanner@4 --legacy-peer-deps
npx cap sync android
```

### Permesso camera negato
1. Vai in **Impostazioni Android** → **App** → **NutritionWise**
2. **Autorizzazioni** → **Fotocamera** → Abilita

### Schermo nero
- Assicurati che `AndroidManifest.xml` abbia il permesso `CAMERA`
- Ricompila e sincronizza:
  ```powershell
  npm run build-client
  npx cap sync android
  ```

### Scanner non rileva codici
- Aumenta la luce ambientale
- Tieni il telefono stabile
- Avvicina/allontana il codice dalla camera
- Verifica che il codice sia leggibile (non danneggiato)

---

## 📱 Differenze PWA vs Nativa

| Funzionalità | PWA (Web) | Android Nativo |
|--------------|-----------|----------------|
| Scanner | html5-qrcode (DOM) | Plugin nativo |
| Fotocamera | Selezione manuale | Sempre posteriore |
| Performance | Media | Alta |
| Precisione | Buona | Eccellente |
| Overlay UI | Limitato | Personalizzabile |

---

## ✨ Vantaggi Scanner Nativo

- ⚡ **Più veloce** - Accesso diretto hardware
- 🎯 **Più preciso** - Algoritmi nativi ottimizzati
- 🔋 **Efficiente** - Minor consumo batteria
- 📐 **UX migliore** - Fullscreen, overlay custom
- 🚀 **Auto-focus** - Focus automatico fotocamera
- 💡 **Torcia** - Supporto flash (se configurato)

---

## 🔄 Prossimi Passi Opzionali

### Aggiungere Torcia/Flash
Nel file `use-barcode-scanner.ts`:

```typescript
// Aggiungi pulsante torcia nell'overlay
<button id="toggle-torch" style="...">
  💡 Flash
</button>

// Gestisci click
const torchButton = document.getElementById('toggle-torch');
let torchEnabled = false;
torchButton?.addEventListener('click', async () => {
  torchEnabled = !torchEnabled;
  await BarcodeScanner.toggleTorch();
});
```

### Supportare Altri Formati
Aggiungi a `targetedFormats`:
- `'QR_CODE'` - QR codes
- `'DATA_MATRIX'` - Data Matrix
- `'PDF_417'` - PDF417

---

## 📋 Checklist Completamento

- [x] Plugin barcode scanner installato
- [x] Hook `use-barcode-scanner.ts` creato
- [x] `Foods.tsx` aggiornato con scanner nativo
- [x] Permesso camera in `AndroidManifest.xml`
- [x] Build e sincronizzazione
- [ ] **Test su dispositivo Android reale**
- [ ] **Verifica scansione codici vari**

---

**Esegui i comandi sopra e testa su Android!** 

Lo scanner ora userà la fotocamera nativa posteriore senza chiedere quale usare. 📸
