import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { eventBus } from './eventBus.js';
import predictionRoutes from './routes/prediction.js';
import matchRoutes from './routes/match.js';
import watchPartyRoutes from './routes/watchParty.js';
import swapRoutes from './routes/swap.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/prediction', predictionRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/watch-party', watchPartyRoutes);
app.use('/api/swap', swapRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// WebSocket: broadcast to all connected clients
wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  ws.on('close', () => console.log('[WS] Client disconnected'));
});

// Relay all eventBus events to WebSocket clients
eventBus.on('broadcast', (event, data) => {
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[MatchStake Backend] running on http://localhost:${PORT}`);
});
