# Vecchio backend demo (maggio 2026) — non usare

`server.js` e `client.html` sono la demo locale precedente: WebSocket senza
autenticazione, rotte `/api/notify` e `/api/alert-level` **senza area pilota**.

Non sono compatibili con l'app di oggi, che chiama `/api/areas/:areaId/...`.
Avviarli qui (`npm start`) fa credere che il sistema funzioni mentre l'app non
riceve niente: e' il motivo per cui sono stati spostati qui invece che lasciati
nella cartella principale.

Il backend vero e' in `../../PRIMES_Backend`. Vedi il README del cruscotto.
