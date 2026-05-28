import express from 'express';
import { randomUUID } from 'crypto';
import {
  createRoom,
  getRoom,
  joinRoom,
  addPrediction,
  resolveRoom,
  listRooms,
} from '../services/watchPartyService.js';
import { eventBus } from '../eventBus.js';

const router = express.Router();

// GET /api/watch-party/rooms — list all active rooms
router.get('/rooms', (_, res) => {
  res.json(listRooms());
});

// POST /api/watch-party/room — create a new watch party room
// Body: { matchId, homeTeam, awayTeam, creator }
router.post('/room', (req, res) => {
  const { matchId, homeTeam, awayTeam, creator } = req.body;
  if (!matchId || !homeTeam || !awayTeam || !creator) {
    return res.status(400).json({ error: 'matchId, homeTeam, awayTeam, creator are required' });
  }

  const roomId = randomUUID().slice(0, 8);
  const room = createRoom({ roomId, matchId, homeTeam, awayTeam, creator });
  eventBus.emit('broadcast', 'room:created', room);
  res.json({ success: true, room });
});

// GET /api/watch-party/room/:roomId
router.get('/room/:roomId', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// POST /api/watch-party/room/:roomId/join
// Body: { address }
router.post('/room/:roomId/join', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address required' });

  const room = joinRoom(req.params.roomId, address);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  eventBus.emit('broadcast', 'member:joined', { roomId: req.params.roomId, address });
  res.json({ success: true, room });
});

// POST /api/watch-party/room/:roomId/predict
// Body: { address, predictedResult, predictedHomeScore, predictedAwayScore }
router.post('/room/:roomId/predict', (req, res) => {
  const { address, predictedResult, predictedHomeScore, predictedAwayScore } = req.body;
  if (!address || !predictedResult) {
    return res.status(400).json({ error: 'address and predictedResult required' });
  }

  const room = addPrediction(req.params.roomId, {
    address,
    predictedResult,
    predictedHomeScore,
    predictedAwayScore,
  });

  if (!room) return res.status(404).json({ error: 'Room not found' });

  eventBus.emit('broadcast', 'prediction:made', {
    roomId: req.params.roomId,
    address,
    predictedResult,
    predictedHomeScore,
    predictedAwayScore,
  });

  res.json({ success: true, room });
});

// POST /api/watch-party/room/:roomId/resolve
router.post('/room/:roomId/resolve', (req, res) => {
  const room = resolveRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  eventBus.emit('broadcast', 'match:resolved', {
    roomId: req.params.roomId,
    homeTeam: room.homeTeam,
    awayTeam: room.awayTeam,
  });
  res.json({ success: true, room });
});

export default router;
