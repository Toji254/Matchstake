import express from 'express';
import { generatePrediction, generateChatReply } from '../services/aiService.js';

const router = express.Router();

// POST /api/prediction/chat — room co-pilot replies
router.post('/chat', async (req, res) => {
  const { homeTeam, awayTeam, message } = req.body || {};

  if (!homeTeam || !awayTeam || !message) {
    return res.status(400).json({ error: 'homeTeam, awayTeam, and message are required' });
  }

  try {
    const result = await generateChatReply(homeTeam, awayTeam, message);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Prediction/chat] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prediction/:homeTeam/:awayTeam
router.get('/:homeTeam/:awayTeam', async (req, res) => {
  const { homeTeam, awayTeam } = req.params;

  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'homeTeam and awayTeam are required' });
  }

  try {
    const prediction = await generatePrediction(
      decodeURIComponent(homeTeam),
      decodeURIComponent(awayTeam)
    );
    res.json({ success: true, prediction });
  } catch (err) {
    console.error('[Prediction] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
