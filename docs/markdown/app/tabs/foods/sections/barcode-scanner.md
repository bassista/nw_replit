[Docs](../../../README.md) / [App](../../README.md) / [Foods](../index.md) / Barcode Scanner

## Section TOC
- [Foods Index](../index.md)
- Sections: [Barcode Scanner](barcode-scanner.md), [Food List](food-list.md), [Add/Edit Food](add-edit-food.md)

# Cibi · Scanner Barcode

## Obiettivo
Scansionare il codice a barre per recuperare i dati da OpenFoodFacts e creare un nuovo cibo.

## Comportamento
- Su Android/iOS: apre la fotocamera nativa (retro) con overlay minimale
- Su Web: usa HTML5 Camera con selezione device, se permessi concessi

## UX
- Overlay scuro con riquadro verde centrale
- Solo pulsante "Annulla" visibile durante scansione

## Implementazione
- Hook: `useBarcodeScanner()`
- Permessi: richiesta camera con `checkPermission({ force: true })`
- Avvio: `BarcodeScanner.prepare()` + `BarcodeScanner.startScan({ targetedFormats })`
- Pulizia: `BarcodeScanner.stopScan()` + rimozione overlay

## Errori noti
- Permessi negati: mostra toast e istruzioni
- Web: alcuni device non permettono back camera (usa facingMode "environment")

---
Back to top: [Foods Index](../index.md) · [App Index](../../README.md)
