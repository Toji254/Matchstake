import express from 'express';
import { getSwapQuote } from '../services/swapService.js';

const router = express.Router();

// POST /api/swap/quote
router.post('/quote', async (req, res) => {
  const { fromToken, toToken, amount, chainId } = req.body;
  try {
    const quote = await getSwapQuote({ fromToken, toToken, amount, chainId });
    res.json({ success: true, quote });
  } catch (err) {
    console.error('[Swap] Quote error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
