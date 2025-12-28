[Docs](../README.md) / [Architecture](index.md) / Limitazioni

## Section TOC
- [Overview](index.md)
- [Frontend](frontend.md)
- [Mobile](mobile.md)
- [Build & Deploy](build-deploy.md)
- [Limitazioni](limitations.md)
- [Roadmap](roadmap.md)

# Architettura · Limitazioni

## Attuali
- Dati solo locali (nessun sync cloud)
- Single device: nessuna multiutenza/sincronizzazione
- Scanner web limitato su alcuni browser/device
- Notifiche solo su Android (iOS non configurato)

## Tecniche
- ID notifiche devono essere `int` (Android)
- Accesso camera richiede permessi runtime

---
Back to top: [Architecture Overview](index.md) · [Docs Root](../README.md)
