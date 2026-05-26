import express from 'express';

// In-memory match data store (seeded with realistic 2026 WC matches)
const MATCHES_DB = new Map([
  [1, { matchId: 1, homeTeam: 'Mexico', awayTeam: 'South Africa', kickoffTime: '2026-06-14T20:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [2, { matchId: 2, homeTeam: 'Korea Republic', awayTeam: 'Czechia', kickoffTime: '2026-06-14T21:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [3, { matchId: 3, homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', kickoffTime: '2026-06-15T18:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [4, { matchId: 4, homeTeam: 'USA', awayTeam: 'Paraguay', kickoffTime: '2026-06-15T20:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [5, { matchId: 5, homeTeam: 'Qatar', awayTeam: 'Switzerland', kickoffTime: '2026-06-16T18:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [6, { matchId: 6, homeTeam: 'Brazil', awayTeam: 'Morocco', kickoffTime: '2026-06-16T21:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [7, { matchId: 7, homeTeam: 'Haiti', awayTeam: 'Scotland', kickoffTime: '2026-06-17T18:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [8, { matchId: 8, homeTeam: 'Australia', awayTeam: 'Türkiye', kickoffTime: '2026-06-17T20:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [9, { matchId: 9, homeTeam: 'Germany', awayTeam: 'Curaçao', kickoffTime: '2026-06-18T18:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
  [10, { matchId: 10, homeTeam: 'Netherlands', awayTeam: 'Japan', kickoffTime: '2026-06-18T20:00:00Z', homeScore: 0, awayScore: 0, resolved: false, result: 'PENDING' }],
]);

const router = express.Router();

// GET /api/match/:id
router.get('/:id', (req, res) => {
  const match = MATCHES_DB.get(Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

// GET /api/match — list all matches
router.get('/', (_, res) => {
  res.json([...MATCHES_DB.values()]);
});

export default router;
