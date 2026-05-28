// MatchStake Contract Configuration
// Addresses are injected by the deploy script (start-testnet.sh).
export const CONTRACT_ADDRESS = '0xB60E8451E89Dd40D941fffE43815DBD189Da4fd0';
export const NFT_ADDRESS = '0x127EB6cD9DE956e95312CA9fC181f5eC1879F210';

// Uniswap v4 proof (X Layer Testnet)
// Deployed via: contracts/scripts/deploy_v4.js
export const V4_POOLMANAGER_ADDRESS = '0xAc7Ae1DDF61cfC7ece2e603937a872Fb361Aaf2f';
export const V4_HOOK_ADDRESS = '0xC74A52aBb0be701dA73B72063e57A20bf5Eb40c0';
export const V4_POOL_CURRENCY0 = '0x0000000000000000000000000000000000000000'; // native OKB (gas token)
export const V4_POOL_CURRENCY1 = '0xf7B3dD611172d8bD32A346907f9f86cA40724553'; // MockERC20 "MSD"
export const V4_HOOK_DEPLOY_TX = '0x714486814e6db7061886343d581025914fe51bde9d2751efcf3ce04beec81ad8';
export const V4_POOL_INIT_TX = '0xb3cede709d6014575096cb770b8952b626e18e7c42ce52a90fcd927a5c6f6b7c';

export const CONTRACT_ABI = [
  // Match Management
  {
    inputs: [
      { name: '_homeTeam', type: 'string' },
      { name: '_awayTeam', type: 'string' },
      { name: '_kickoffTime', type: 'uint256' },
    ],
    name: 'createMatch',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_matchId', type: 'uint256' },
      { name: '_homeScore', type: 'uint8' },
      { name: '_awayScore', type: 'uint8' },
    ],
    name: 'resolveMatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Room Management
  {
    inputs: [
      { name: '_matchId', type: 'uint256' },
      { name: '_minStake', type: 'uint256' },
      { name: '_maxStake', type: 'uint256' },
      { name: '_maxMembers', type: 'uint256' },
    ],
    name: 'createRoom',
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'joinRoom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_inviteCode', type: 'bytes32' }],
    name: 'joinRoomByCode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Predictions
  {
    inputs: [
      { name: '_roomId', type: 'uint256' },
      { name: '_predictedResult', type: 'uint8' },
      { name: '_predictedHomeScore', type: 'uint8' },
      { name: '_predictedAwayScore', type: 'uint8' },
    ],
    name: 'makePrediction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Resolution
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'resolveRoom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // View Functions
  {
    inputs: [{ name: '_matchId', type: 'uint256' }],
    name: 'getMatch',
    outputs: [
      {
        components: [
          { name: 'matchId', type: 'uint256' },
          { name: 'homeTeam', type: 'string' },
          { name: 'awayTeam', type: 'string' },
          { name: 'kickoffTime', type: 'uint256' },
          { name: 'homeScore', type: 'uint8' },
          { name: 'awayScore', type: 'uint8' },
          { name: 'result', type: 'uint8' },
          { name: 'resolved', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'getRoom',
    outputs: [
      {
        components: [
          { name: 'roomId', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'inviteCode', type: 'bytes32' },
          { name: 'matchId', type: 'uint256' },
          { name: 'minStake', type: 'uint256' },
          { name: 'maxStake', type: 'uint256' },
          { name: 'maxMembers', type: 'uint256' },
          { name: 'totalPool', type: 'uint256' },
          { name: 'memberCount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_roomId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    name: 'getPrediction',
    outputs: [
      {
        components: [
          { name: 'predictor', type: 'address' },
          { name: 'predictedResult', type: 'uint8' },
          { name: 'predictedHomeScore', type: 'uint8' },
          { name: 'predictedAwayScore', type: 'uint8' },
          { name: 'stakeAmount', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
          { name: 'points', type: 'uint256' },
          { name: 'nftTokenId', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllMatchIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllRoomIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'getRoomMembers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_roomId', type: 'uint256' }],
    name: 'getRoomPredictors',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserRooms',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_matchId', type: 'uint256' }],
    name: 'getRoomsByMatch',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_player', type: 'address' }],
    name: 'getLeaderboardEntry',
    outputs: [
      {
        components: [
          { name: 'player', type: 'address' },
          { name: 'totalPoints', type: 'uint256' },
          { name: 'totalWinnings', type: 'uint256' },
          { name: 'roomsJoined', type: 'uint256' },
          { name: 'correctPredictions', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_count', type: 'uint256' }],
    name: 'getTopPlayers',
    outputs: [
      {
        components: [
          { name: 'player', type: 'address' },
          { name: 'totalPoints', type: 'uint256' },
          { name: 'totalWinnings', type: 'uint256' },
          { name: 'roomsJoined', type: 'uint256' },
          { name: 'correctPredictions', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_roomId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    name: 'isRoomMember',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Squad Management
  {
    inputs: [{ name: '_name', type: 'string' }],
    name: 'createSquad',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_squadId', type: 'uint256' }],
    name: 'joinSquad',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'userSquad',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'squads',
    outputs: [
      { name: 'squadId', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'captain', type: 'address' },
      { name: 'memberCount', type: 'uint256' },
      { name: 'totalPredictions', type: 'uint256' },
      { name: 'totalPoints', type: 'uint256' },
      { name: 'totalWinnings', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_count', type: 'uint256' }],
    name: 'getTopSquads',
    outputs: [
      {
        components: [
          { name: 'squadId', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'captain', type: 'address' },
          { name: 'memberCount', type: 'uint256' },
          { name: 'totalPredictions', type: 'uint256' },
          { name: 'totalPoints', type: 'uint256' },
          { name: 'totalWinnings', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_squadId', type: 'uint256' }],
    name: 'getSquadMembers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Admin / General
  {
    inputs: [{ name: '_predictionNFT', type: 'address' }],
    name: 'setPredictionNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'matchId', type: 'uint256' },
      { indexed: false, name: 'homeTeam', type: 'string' },
      { indexed: false, name: 'awayTeam', type: 'string' },
      { indexed: false, name: 'kickoffTime', type: 'uint256' },
    ],
    name: 'MatchCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'roomId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'matchId', type: 'uint256' },
      { indexed: false, name: 'inviteCode', type: 'bytes32' },
    ],
    name: 'RoomCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'roomId', type: 'uint256' },
      { indexed: true, name: 'member', type: 'address' },
    ],
    name: 'RoomJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'roomId', type: 'uint256' },
      { indexed: true, name: 'predictor', type: 'address' },
      { indexed: false, name: 'predictedResult', type: 'uint8' },
      { indexed: false, name: 'stakeAmount', type: 'uint256' },
      { indexed: false, name: 'nftTokenId', type: 'uint256' },
    ],
    name: 'PredictionMade',
    type: 'event',
  },
];

// ABI for the PredictionNFT contract
export const NFT_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserTokens',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'nftData',
    outputs: [
      { name: 'roomId', type: 'uint256' },
      { name: 'matchId', type: 'uint256' },
      { name: 'homeTeam', type: 'string' },
      { name: 'awayTeam', type: 'string' },
      { name: 'predictionText', type: 'string' },
      { name: 'predictedOutcome', type: 'string' },
      { name: 'stakeAmount', type: 'uint256' },
      { name: 'pointsEarned', type: 'uint256' },
      { name: 'resolved', type: 'bool' },
      { name: 'isWinner', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Helper: parse wallet/contract errors into user-friendly messages
export function parseContractError(err, fallback = 'Transaction failed') {
  const raw = err?.shortMessage || err?.message || '';
  const lower = raw.toLowerCase();

  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return 'Transaction cancelled by user.';
  }
  if (lower.includes('risk') || lower.includes('legal')) {
    return 'Your wallet flagged this contract as risky. Try clearing your wallet cache, or deploy fresh contracts to X Layer Testnet using: bash start-testnet.sh';
  }
  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
    return 'Insufficient OKB balance. Get testnet OKB from the X Layer faucet.';
  }
  if (lower.includes('chain mismatch') || lower.includes('wrong network') || lower.includes('chain id')) {
    return 'Wrong network. Please switch to X Layer Testnet (Chain ID 1952).';
  }
  if (lower.includes('nonce')) {
    return 'Nonce error. Try resetting your wallet activity in settings.';
  }
  if (lower.includes('could not detect network') || lower.includes('network error') || lower.includes('fetch')) {
    return 'Cannot connect to X Layer Testnet RPC. Check your internet connection.';
  }
  if (lower.includes('execution reverted')) {
    // Try to extract the revert reason
    const revertMatch = raw.match(/reason:\s*(.+?)(?:\n|$)/i) || raw.match(/reverted with reason string '(.+?)'/);
    if (revertMatch) return `Contract error: ${revertMatch[1]}`;
    return 'Transaction reverted by the smart contract.';
  }
  return raw || fallback;
}

// Helper: check if the app is currently in demo/tour mode
export function checkDemoMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const demoUrl = params.get('demo');
  if (demoUrl === 'true') {
    sessionStorage.setItem('matchstake_demo_mode', 'true');
    return true;
  } else if (demoUrl === 'false') {
    sessionStorage.removeItem('matchstake_demo_mode');
    return false;
  }
  return sessionStorage.getItem('matchstake_demo_mode') === 'true';
}

