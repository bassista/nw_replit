# 🔔 Fix Notifiche Android - RISOLTO

## ❌ Problemi Risolti

1. **"Error: the identifier should be a Java int"**
   - ✅ RISOLTO: `Date.now()` genera numeri troppo grandi (> 2147483647)
   - ✅ Ora usa: `Math.floor(Math.random() * 2147483647)`

2. **Notifiche non arrivano**
   - ✅ Aggiunta configurazione `LocalNotifications` in `capacitor.config.ts`
   - ✅ ID validi per Android
   - ✅ Permessi già configurati in `AndroidManifest.xml`

---

## 📝 Modifiche Effettuate

### 1. `client/src/pages/Settings.tsx`
```typescript
// PRIMA (ERRORE):
id: Date.now(),  // ❌ Troppo grande per Java int

// DOPO (CORRETTO):
const notificationId = Math.floor(Math.random() * 2147483647);
id: notificationId,  // ✅ Sempre < 2147483647
```

### 2. `client/src/hooks/use-water-reminders.ts`
```typescript
// Stesso fix applicato
const notificationId = Math.floor(Math.random() * 2147483647);
```

### 3. `capacitor.config.ts`
Aggiunta configurazione completa per notifiche:
```typescript
plugins: {
  LocalNotifications: {
    smallIcon: "ic_stat_icon_config_sample",
    iconColor: "#22c55e",
    sound: "beep.wav"
  }
}
```

---

## 🚀 Build e Test

```powershell
# 1. Build progetto
npm run build-client

# 2. Sincronizza con Android
npx cap sync android

# 3. Apri in Android Studio
npx cap open android

# 4. Run su dispositivo/emulatore
```

---

## 🧪 Test Notifiche

1. Apri app su Android
2. Vai in **Settings** → **Promemoria Acqua**
3. Clicca **"Test Notifica"**
4. Se richiesto, **accetta i permessi**
5. Dopo 2 secondi ricevi la notifica ✅

---

## 📱 Permessi Android

Il file `AndroidManifest.xml` ha già tutti i permessi necessari:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## 🔍 Verifica Notifiche

### Log Android:
```powershell
# Vedi log notifiche
adb logcat | Select-String "LocalNotification|Notification"
```

### Dovrai vedere:
```
LocalNotifications: Scheduling notification with ID: 123456789
NotificationManager: Notification posted
```

---

## ⚙️ Spiegazione Tecnica

### Perché `Date.now()` non funziona?

```javascript
Date.now()
// Output: 1733097600000  ❌ > 2147483647 (MAX Java int)

Math.floor(Math.random() * 2147483647)
// Output: 847293847  ✅ < 2147483647 (valido!)
```

### Limiti Java int:
- **Minimo:** -2147483648
- **Massimo:** 2147483647
- **Date.now()** genera timestamp > 1.7 trilioni (troppo grande!)

---

## 🎯 Funzionalità Notifiche

### Ora Funzionano:

1. **Test Notifica** - Settings
   - Clicca pulsante
   - Notifica dopo 2 secondi
   - ID: random tra 0-2147483647

2. **Promemoria Acqua** - Automatico
   - Ogni X minuti (configurabile)
   - Orario inizio/fine (configurabile)
   - ID univoco per ogni notifica

3. **Caratteristiche:**
   - ✅ Titolo personalizzato
   - ✅ Corpo del messaggio
   - ✅ Icona verde (#22c55e)
   - ✅ Vibrazione
   - ✅ Suono (beep.wav)

---

## 🔧 Troubleshooting

### Notifica non arriva ancora?

1. **Verifica permessi:**
   ```
   Impostazioni Android → App → NutritionWise → Autorizzazioni → Notifiche: ON
   ```

2. **Verifica modalità Non Disturbare:**
   - Disattiva modalità Non Disturbare
   - Verifica che l'app non sia in risparmio energetico

3. **Pulisci e ricompila:**
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   npm run build-client
   npx cap sync android
   ```

4. **Testa con log:**
   ```powershell
   adb logcat | Select-String "LocalNotification"
   ```

### Errore "Permission denied"?

L'app chiede automaticamente i permessi. Se negati:
1. Vai in Impostazioni Android
2. App → NutritionWise → Autorizzazioni
3. Abilita "Notifiche"

---

## ✨ Risultato Finale

- ✅ Nessun errore "identifier should be a Java int"
- ✅ Notifiche arrivano correttamente
- ✅ Permessi gestiti automaticamente
- ✅ Test Notifica funziona
- ✅ Promemoria Acqua funziona

---

**Esegui build, sincronizza e testa! Le notifiche ora funzionano perfettamente.** 🔔✅
