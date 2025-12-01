# 📱 Setup Capacitor e Build Android - NutritionWise

## ✅ Modifiche Completate

Tutti i file necessari sono stati creati e modificati:

1. ✅ `client/src/lib/platform.ts` - Utility per rilevare piattaforma nativa/web
2. ✅ `client/src/hooks/use-water-reminders.ts` - Supporto notifiche native
3. ✅ `client/src/pages/Settings.tsx` - Pulsante "Test Notifica"
4. ✅ `client/src/App.tsx` - Inizializzazione Capacitor
5. ✅ `client/src/index.css` - Stili per scanner
6. ✅ `android/app/src/main/AndroidManifest.xml` - Permessi notifiche
7. ✅ `capacitor.config.ts` - Configurazione (da creare se non esiste)

---

## 🚀 Comandi da Eseguire

### 1️⃣ Build Web
```powershell
npm run build-client
```

### 2️⃣ Sincronizza con Android
```powershell
npx cap sync android
```

### 3️⃣ Apri in Android Studio
```powershell
npx cap open android
```

### 4️⃣ Build APK Debug (da Android Studio)
In Android Studio:
- Clicca su **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Oppure usa il terminale in Android Studio:
  ```bash
  ./gradlew assembleDebug
  ```

### 5️⃣ Build APK Release (firmato)

#### Prima volta - Crea Keystore:
```powershell
cd android\app
keytool -genkey -v -keystore nutrition-wise.keystore -alias nutrition-wise -keyalg RSA -keysize 2048 -validity 10000
cd ..\..
```

#### Crea file `android/keystore.properties`:
```properties
storePassword=LA_TUA_PASSWORD
keyPassword=LA_TUA_PASSWORD
keyAlias=nutrition-wise
storeFile=nutrition-wise.keystore
```

#### Modifica `android/app/build.gradle`:
Aggiungi all'inizio del file (prima di `android {`):

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Build Release:
```powershell
npm run build-client
npx cap sync android
cd android
.\gradlew assembleRelease
cd ..
```

**APK firmato:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🧪 Test Notifiche

1. Avvia l'app su Android (emulatore o dispositivo)
2. Vai in **Settings** / **Impostazioni**
3. Scorri fino alla sezione **Promemoria Acqua**
4. Clicca il pulsante **"Test Notifica"**
5. Se richiesto, accetta i permessi notifiche
6. Dopo 2 secondi dovresti ricevere una notifica di test

---

## 🔍 Debug

### Visualizza Log:
```powershell
adb logcat | Select-String "Capacitor|Console|Notification"
```

### Verifica Dispositivi Connessi:
```powershell
adb devices
```

### Installa APK Manualmente:
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Script NPM Disponibili

```json
{
  "cap:sync": "npm run build-client && npx cap sync",
  "cap:open:android": "npx cap open android",
  "android:build": "npm run build-client && npx cap sync android && cd android && gradlew.bat assembleDebug",
  "android:build:release": "npm run build-client && npx cap sync android && cd android && gradlew.bat assembleRelease",
  "android:run": "npm run cap:sync && npx cap run android"
}
```

---

## ⚠️ Troubleshooting

### Errore: "Missing script: android:build"
Aggiungi gli script nel `package.json` (vedi sopra).

### Errore: "gradlew: command not found"
Usa `gradlew.bat` su Windows invece di `./gradlew`.

### Notifiche non funzionano:
1. Verifica che `AndroidManifest.xml` contenga i permessi
2. Controlla i log con `adb logcat`
3. Prova il pulsante "Test Notifica" nelle impostazioni
4. Su Android 13+, i permessi devono essere richiesti esplicitamente (già implementato)

### Build fallisce:
```powershell
cd android
.\gradlew clean
cd ..
npm run build-client
npx cap sync android
```

---

## 🎯 Workflow Sviluppo

```powershell
# 1. Modifica codice in client/src/
# 2. Build e test
npm run build-client
npx cap sync android
npx cap run android

# 3. Per release finale
npm run android:build:release
```

---

## 📱 Distribuzione

### Google Play Store:
1. Build release APK firmato (vedi sopra)
2. Vai su [Google Play Console](https://play.google.com/console)
3. Crea nuova app
4. Carica l'APK/AAB
5. Compila le informazioni richieste
6. Pubblica

### Distribuzione Diretta (APK):
1. Build release APK
2. Condividi `app-release.apk`
3. Utenti devono abilitare "Installa da fonti sconosciute"

---

## ✨ Funzionalità Native Implementate

- ✅ Notifiche native (LocalNotifications)
- ✅ Status bar personalizzata (colore verde)
- ✅ Splash screen
- ✅ Gestione back button Android
- ✅ App state management (pausa/resume)
- ✅ Feature detection web/native
- ✅ PWA rimane funzionante

---

## 🌐 PWA vs Nativa

L'app continua a funzionare come PWA su web browser. Le funzionalità native sono attive solo nell'app Android:

| Funzionalità | PWA (Web) | Android App |
|--------------|-----------|-------------|
| LocalStorage | ✅ | ✅ |
| Barcode Scanner | ✅ html5-qrcode | ✅ html5-qrcode |
| Notifiche | ✅ Web Notifications | ✅ Native Notifications |
| Service Worker | ✅ | ✅ |
| Status Bar | ❌ | ✅ Personalizzata |
| Splash Screen | ❌ | ✅ |
| App Icon | ❌ | ✅ |

---

**Tutto pronto! Esegui i comandi sopra per generare l'APK.**
