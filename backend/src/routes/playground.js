import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { eventBus } from '../eventBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTRACTS_DIR = path.resolve(__dirname, '../../../contracts');

const router = express.Router();

// POST /api/playground/create-match
router.post('/create-match', (req, res) => {
  const { homeTeam, awayTeam } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'homeTeam and awayTeam are required' });
  }

  console.log(`[Playground API] Executing create_mock_match for ${homeTeam} vs ${awayTeam}...`);
  
  const env = { ...process.env, MATCH_HOME: homeTeam, MATCH_AWAY: awayTeam };
  
  exec('npx hardhat run scripts/create_mock_match.js --network xlayer_testnet', { cwd: CONTRACTS_DIR, env }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Playground API] createMatch execution error:`, error);
      return res.status(500).json({ error: 'Failed to create mock match on-chain', details: stderr || error.message });
    }

    console.log(`[Playground API] stdout:`, stdout);
    
    const match = stdout.match(/SUCCESS:Created match with ID: (\d+)/);
    const hashMatch = stdout.match(/TX_HASH:(0x[a-fA-F0-9]{64})/);
    const txHash = hashMatch ? hashMatch[1] : null;
    
    if (match) {
      const matchId = parseInt(match[1]);
      return res.json({ success: true, matchId, homeTeam, awayTeam, txHash });
    }

    res.status(500).json({ error: 'Transaction succeeded but could not parse match ID', output: stdout });
  });
});

// POST /api/playground/resolve-match
router.post('/resolve-match', (req, res) => {
  const { matchId, homeScore, awayScore } = req.body;
  if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: 'matchId, homeScore, and awayScore are required' });
  }

  console.log(`[Playground API] Executing resolve_mock_match for ID ${matchId} (${homeScore}-${awayScore})...`);
  
  const env = { ...process.env, MATCH_ID: String(matchId), HOME_SCORE: String(homeScore), AWAY_SCORE: String(awayScore) };
  
  exec('npx hardhat run scripts/resolve_mock_match.js --network xlayer_testnet', { cwd: CONTRACTS_DIR, env }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Playground API] resolveMatch execution error:`, error);
      return res.status(500).json({ error: 'Failed to resolve mock match on-chain', details: stderr || error.message });
    }

    console.log(`[Playground API] stdout:`, stdout);
    
    const hashMatch = stdout.match(/TX_HASH:(0x[a-fA-F0-9]{64})/);
    const txHash = hashMatch ? hashMatch[1] : null;

    if (stdout.includes('SUCCESS:Resolved match ID')) {
      eventBus.emit('broadcast', 'playground:match:resolved', {
        matchId: parseInt(matchId),
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      });
      return res.json({ success: true, matchId: parseInt(matchId), homeScore, awayScore, txHash });
    }

    res.status(500).json({ error: 'Transaction execution failed or returned unexpected output', output: stdout });
  });
});

export default router;
