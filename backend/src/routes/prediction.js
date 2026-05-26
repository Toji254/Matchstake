import express from 'express';
import { generatePrediction } from '../services/aiService.js';

const router = express.Router();

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
