// MatchStake Contract Configuration
// Update CONTRACT_ADDRESS and NFT_ADDRESS after deployment

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // TODO: Update after deploy
export const NFT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';      // TODO: Update after deploy

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
