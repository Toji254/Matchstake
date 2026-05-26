// In-memory watch party room state
// Key: roomId (string), Value: RoomState object
const rooms = new Map();

export function createRoom({ roomId, matchId, homeTeam, awayTeam, creator }) {
  const room = {
    roomId,
    matchId,
    homeTeam,
    awayTeam,
    members: [{ address: creator, joinedAt: Date.now(), hasPredicted: false, prediction: null }],
    predictions: [],
    status: 'waiting', // 'waiting' | 'active' | 'resolved'
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function joinRoom(roomId, address) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (!room.members.find(m => m.address.toLowerCase() === address.toLowerCase())) {
    room.members.push({ address, joinedAt: Date.now(), hasPredicted: false, prediction: null });
  }
  return room;
}

export function addPrediction(roomId, { address, predictedResult, predictedHomeScore, predictedAwayScore }) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const existing = room.predictions.find(p => p.address.toLowerCase() === address.toLowerCase());
  if (existing) return room; // already predicted

  const prediction = {
    address,
    predictedResult,
    predictedHomeScore,
    predictedAwayScore,
    timestamp: Date.now(),
  };

  room.predictions.push(prediction);

  const member = room.members.find(m => m.address.toLowerCase() === address.toLowerCase());
  if (member) {
    member.hasPredicted = true;
    member.prediction = prediction;
  }

  if (room.status === 'waiting' && room.members.length > 0) {
    room.status = 'active';
  }

  return room;
}

export function resolveRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.status = 'resolved';
  return room;
}

export function listRooms() {
  return [...rooms.values()];
}
