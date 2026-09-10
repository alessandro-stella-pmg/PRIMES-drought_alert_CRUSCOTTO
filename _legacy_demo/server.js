const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

let currentAlertLevel = { level: 'Livello 2 - Allarme', colorHex: '#FF9800' };

wss.on('connection', (ws, req) => {
  const clientAddress = req.socket.remoteAddress;
  console.log(`[ws] New client connected: ${clientAddress}`);
  clients.add(ws);

  ws.send(JSON.stringify({ event: 'welcome', data: { message: 'Connected to PRIMES demo backend.' } }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[ws] Client disconnected: ${clientAddress}`);
  });
});

function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

app.post('/api/notify', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.type || !payload.title || !payload.message) {
    return res.status(400).json({ error: 'Missing required fields: type, title, message.' });
  }

  const notification = {
    type: payload.type,
    title: payload.title,
    message: payload.message,
    target: payload.target || 'all',
    extra: payload.extra || null,
    timestamp: new Date().toISOString(),
  };

  console.log(`[api] notify ${notification.type} -> ${notification.title}`);
  broadcast({ event: 'notification', data: notification });
  res.json({ ok: true, sentClients: clients.size, notification });
});

app.post('/api/alert-level', (req, res) => {
  const { level, colorHex } = req.body;
  if (!level || !colorHex) {
    return res.status(400).json({ error: 'Campi mancanti: level, colorHex.' });
  }
  currentAlertLevel = { level, colorHex };
  console.log(`[api] alert-level -> ${level}`);

  broadcast({ event: 'alert_level_change', data: { level, colorHex } });

  const notification = {
    type: 'communication',
    title: 'Livello di allerta modificato',
    message: 'È stato modificato il livello di allerta per la tua area pilota.',
    target: 'all',
    extra: null,
    timestamp: new Date().toISOString(),
  };
  broadcast({ event: 'notification', data: notification });

  res.json({ ok: true, sentClients: clients.size, currentAlertLevel });
});

app.get('/api/alert-level', (req, res) => {
  res.json({ ok: true, currentAlertLevel });
});

app.get('/api/status', (req, res) => {
  res.json({ ok: true, clients: clients.size });
});

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  console.log(`Dashboard available at http://localhost:${port}/`);
  console.log(`Mobile receiver available at http://localhost:${port}/client.html`);
});
