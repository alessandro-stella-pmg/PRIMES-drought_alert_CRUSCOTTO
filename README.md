# PRIMES — Cruscotto Web

Questa cartella contiene **solo il front-end** del cruscotto: `index.html` più le
immagini. Non c'è un server qui dentro.

Il backend è in [`../PRIMES_Backend`](../PRIMES_Backend): REST + WebSocket +
Firebase Cloud Messaging, tutto scoped per area pilota.

> Il vecchio backend demo (`server.js`, `client.html`) è stato spostato in
> `_legacy_demo/`. Non era più compatibile con l'app: esponeva `/api/notify` e
> `/api/alert-level` senza area pilota, mentre l'app chiama
> `/api/areas/:areaId/...`. Avviarlo dava l'impressione che tutto funzionasse
> mentre l'app non riceveva niente.

## Provare in locale

```bash
cd ../PRIMES_Backend
npm install
SERVE_DASHBOARD=true npm start
```

Cruscotto e API sulla stessa origine, `http://localhost:4000/` — così non c'è
CORS di mezzo. L'app va puntata sullo stesso indirizzo:

```bash
cd ../app_PRIMES
# 10.0.2.2 e' il PC visto dall'emulatore Android; su telefono fisico serve l'IP
flutter run --dart-define=BACKEND_URL=http://10.0.2.2:4000
```

## Provare in produzione

Backend già online su Cloud Run — è il default dell'app, non serve alcun
`--dart-define`:

```
https://primes-backend-225520625301.europe-west8.run.app
```

Stato del servizio: `GET /api/health`. Deve rispondere `"firebase": true` e
`"store": "firestore"`.

## Pubblicare il cruscotto

```bash
# da questa cartella
firebase deploy --only hosting
```

Il progetto Firebase e' gia' fissato in `.firebaserc`, quindi non serve
`firebase use`.

`firebase.json` inoltra `/api/**` al servizio Cloud Run, quindi cruscotto e API
finiscono sulla stessa origine.

## Livelli di allerta

Il cruscotto manda al backend `level`, `colorHex` **e `key`** (`none`, `level1`,
`level2`, `level3`). La chiave non è decorativa: è quella che permette all'app
di mostrare il nome del livello scritto dal referente dell'area nel form,
invece dell'etichetta italiana di servizio. Se si aggiunge o rinomina un
livello, vanno aggiornate anche `ALERT_LEVELS` in `PRIMES_Backend/src/areas.js`
e la lista dei livelli in `app_PRIMES/lib/config/area_content.dart`.
