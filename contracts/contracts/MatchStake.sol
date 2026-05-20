// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPredictionNFT {
    function mint(
        address to,
        uint256 roomId,
        uint256 matchId,
        string calldata homeTeam,
        string calldata awayTeam,
        string calldata predictionText,
        string calldata predictedOutcome,
        uint256 stakeAmount
    ) external returns (uint256);
    
    function resolve(
        uint256 tokenId,
        uint256 pointsEarned,
        bool isWinner
    ) external;
}

/**
 * @title MatchStake
 * @notice World Cup Watch Party Social Staking Protocol
 * @dev Create rooms, predict match outcomes, stake crypto, auto-distribute winnings
 * 
 * Built for OKX X Cup Hackathon — deployed on X Layer
 */
contract MatchStake {
    // ============================================================
    //                        TYPES
    // ============================================================

    enum MatchResult { PENDING, HOME_WIN, AWAY_WIN, DRAW }
    enum RoomStatus { OPEN, LOCKED, RESOLVED }

    struct Match {
        uint256 matchId;
        string homeTeam;
        string awayTeam;
        uint256 kickoffTime;
        uint8 homeScore;
        uint8 awayScore;
        MatchResult result;
        bool resolved;
    }

    struct Room {
        uint256 roomId;
        address creator;
        bytes32 inviteCode;
        uint256 matchId;
        uint256 minStake;
        uint256 maxStake;
        uint256 maxMembers;
        uint256 totalPool;
        uint256 memberCount;
        RoomStatus status;
        uint256 createdAt;
    }

    struct Prediction {
        address predictor;
        MatchResult predictedResult;
        uint8 predictedHomeScore;
        uint8 predictedAwayScore;
        uint256 stakeAmount;
        bool claimed;
        uint256 points;
        uint256 nftTokenId; // Added for Dynamic NFT support
    }

    struct LeaderboardEntry {
        address player;
        uint256 totalPoints;
        uint256 totalWinnings;
        uint256 roomsJoined;
        uint256 correctPredictions;
    }

    struct Squad {
        uint256 squadId;
        string name;
        address captain;
        uint256 memberCount;
        uint256 totalPredictions;
        uint256 totalPoints;
        uint256 totalWinnings;
    }

    // ============================================================
    //                        STATE
    // ============================================================

    address public owner;
    address public predictionNFT; // Dynamic NFT contract address
    uint256 public platformFeeBps = 250; // 2.5% platform fee
    uint256 public nextRoomId = 1;
    uint256 public nextMatchId = 1;
    uint256 public nextSquadId = 1; // Squad auto-increment

    // Match data
    mapping(uint256 => Match) public matches;
    uint256[] public matchIds;

    // Room data
    mapping(uint256 => Room) public rooms;
    mapping(bytes32 => uint256) public inviteCodeToRoom;
    uint256[] public roomIds;

    // Room members: roomId => member addresses
    mapping(uint256 => address[]) public roomMembers;
    mapping(uint256 => mapping(address => bool)) public isRoomMember;

    // Predictions: roomId => predictor => Prediction
    mapping(uint256 => mapping(address => Prediction)) public predictions;
    mapping(uint256 => address[]) public roomPredictors;

    // Global leaderboard
    mapping(address => LeaderboardEntry) public leaderboard;
    address[] public leaderboardPlayers;
    mapping(address => bool) private isLeaderboardPlayer;

    // Squad data
    mapping(uint256 => Squad) public squads;
    mapping(address => uint256) public userSquad; // user address => squadId (0 = none)
    mapping(uint256 => address[]) public squadMembers;
    uint256[] public squadIds;

    // Platform fees collected
    uint256 public platformFeesCollected;

    // ============================================================
    //                        EVENTS
    // ============================================================

    event MatchCreated(uint256 indexed matchId, string homeTeam, string awayTeam, uint256 kickoffTime);
    event MatchResolved(uint256 indexed matchId, MatchResult result, uint8 homeScore, uint8 awayScore);
    event RoomCreated(uint256 indexed roomId, address indexed creator, uint256 matchId, bytes32 inviteCode);
    event RoomJoined(uint256 indexed roomId, address indexed member);
    event PredictionMade(uint256 indexed roomId, address indexed predictor, MatchResult predictedResult, uint256 stakeAmount, uint256 nftTokenId);
    event WinningsClaimed(uint256 indexed roomId, address indexed claimer, uint256 amount);
    event RoomResolved(uint256 indexed roomId, uint256 totalPool, uint256 winnerCount);
    event SquadCreated(uint256 indexed squadId, string name, address indexed captain);
    event SquadJoined(uint256 indexed squadId, address indexed member);

    // ============================================================
    //                        MODIFIERS
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier roomExists(uint256 _roomId) {
        require(rooms[_roomId].roomId != 0, "Room not found");
        _;
    }

    modifier matchExists(uint256 _matchId) {
        require(matches[_matchId].matchId != 0, "Match not found");
        _;
    }

    // ============================================================
    //                      CONSTRUCTOR
    // ============================================================

    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    //                    MATCH MANAGEMENT (Owner)
    // ============================================================

    /**
     * @notice Create a new World Cup match
     * @dev Only owner can create matches (acts as oracle for hackathon)
     */
    function createMatch(
        string calldata _homeTeam,
        string calldata _awayTeam,
        uint256 _kickoffTime
    ) external onlyOwner returns (uint256) {
        uint256 matchId = nextMatchId++;
        
        matches[matchId] = Match({
            matchId: matchId,
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            kickoffTime: _kickoffTime,
            homeScore: 0,
            awayScore: 0,
            result: MatchResult.PENDING,
            resolved: false
        });
        
        matchIds.push(matchId);
        emit MatchCreated(matchId, _homeTeam, _awayTeam, _kickoffTime);
        return matchId;
    }

    /**
     * @notice Resolve a match with final score
     * @dev Owner inputs the result (admin oracle for hackathon)
     */
    function resolveMatch(
        uint256 _matchId,
        uint8 _homeScore,
        uint8 _awayScore
    ) external onlyOwner matchExists(_matchId) {
        Match storage m = matches[_matchId];
        require(!m.resolved, "Already resolved");

        m.homeScore = _homeScore;
        m.awayScore = _awayScore;
        m.resolved = true;

        if (_homeScore > _awayScore) {
            m.result = MatchResult.HOME_WIN;
        } else if (_awayScore > _homeScore) {
            m.result = MatchResult.AWAY_WIN;
        } else {
            m.result = MatchResult.DRAW;
        }

        emit MatchResolved(_matchId, m.result, _homeScore, _awayScore);
    }

    // ============================================================
    //                    ROOM MANAGEMENT
    // ============================================================

    /**
     * @notice Create a watch party room for a specific match
     * @param _matchId The match to predict on
     * @param _minStake Minimum stake per member (in wei)
     * @param _maxStake Maximum stake per member (in wei)
     * @param _maxMembers Maximum number of members (2-50)
     */
    function createRoom(
        uint256 _matchId,
        uint256 _minStake,
        uint256 _maxStake,
        uint256 _maxMembers
    ) external matchExists(_matchId) returns (uint256, bytes32) {
        require(_maxMembers >= 2 && _maxMembers <= 50, "Members: 2-50");
        require(_minStake > 0, "Min stake must be > 0");
        require(_maxStake >= _minStake, "Max >= Min stake");
        require(!matches[_matchId].resolved, "Match already resolved");

        uint256 roomId = nextRoomId++;
        
        // Generate unique invite code from room data
        bytes32 inviteCode = keccak256(
            abi.encodePacked(roomId, msg.sender, block.timestamp, block.prevrandao)
        );

        rooms[roomId] = Room({
            roomId: roomId,
            creator: msg.sender,
            inviteCode: inviteCode,
            matchId: _matchId,
            minStake: _minStake,
            maxStake: _maxStake,
            maxMembers: _maxMembers,
            totalPool: 0,
            memberCount: 0,
            status: RoomStatus.OPEN,
            createdAt: block.timestamp
        });

        inviteCodeToRoom[inviteCode] = roomId;
        roomIds.push(roomId);

        // Auto-join creator
        _joinRoom(roomId, msg.sender);

        emit RoomCreated(roomId, msg.sender, _matchId, inviteCode);
        return (roomId, inviteCode);
    }

    /**
     * @notice Join a room using invite code
     */
    function joinRoomByCode(bytes32 _inviteCode) external {
        uint256 roomId = inviteCodeToRoom[_inviteCode];
        require(roomId != 0, "Invalid invite code");
        _joinRoom(roomId, msg.sender);
    }

    /**
     * @notice Join a room directly by ID (public rooms)
     */
    function joinRoom(uint256 _roomId) external roomExists(_roomId) {
        _joinRoom(_roomId, msg.sender);
    }

    function _joinRoom(uint256 _roomId, address _member) internal {
        Room storage room = rooms[_roomId];
        require(room.status == RoomStatus.OPEN, "Room not open");
        require(!isRoomMember[_roomId][_member], "Already a member");
        require(room.memberCount < room.maxMembers, "Room full");

        isRoomMember[_roomId][_member] = true;
        roomMembers[_roomId].push(_member);
        room.memberCount++;

        // Track in global leaderboard
        if (!isLeaderboardPlayer[_member]) {
            isLeaderboardPlayer[_member] = true;
            leaderboardPlayers.push(_member);
            leaderboard[_member].player = _member;
        }
        leaderboard[_member].roomsJoined++;

        emit RoomJoined(_roomId, _member);
    }

    // ============================================================
    //                   PREDICTIONS & STAKING
    // ============================================================

    /**
     * @notice Make a prediction and stake native tokens (OKB on X Layer)
     * @param _roomId Room to predict in
     * @param _predictedResult Your predicted match result
     * @param _predictedHomeScore Your predicted home team score
     * @param _predictedAwayScore Your predicted away team score
     */
    function makePrediction(
        uint256 _roomId,
        MatchResult _predictedResult,
        uint8 _predictedHomeScore,
        uint8 _predictedAwayScore
    ) external payable roomExists(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.status == RoomStatus.OPEN, "Room not open");
        require(isRoomMember[_roomId][msg.sender], "Not a member");
        require(predictions[_roomId][msg.sender].stakeAmount == 0, "Already predicted");
        require(msg.value >= room.minStake && msg.value <= room.maxStake, "Stake out of range");
        require(_predictedResult != MatchResult.PENDING, "Must pick a result");
        
        // Validate predicted result matches predicted score
        if (_predictedHomeScore > _predictedAwayScore) {
            require(_predictedResult == MatchResult.HOME_WIN, "Score/result mismatch");
        } else if (_predictedAwayScore > _predictedHomeScore) {
            require(_predictedResult == MatchResult.AWAY_WIN, "Score/result mismatch");
        } else {
            require(_predictedResult == MatchResult.DRAW, "Score/result mismatch");
        }

        uint256 tokenId = 0;
        if (predictionNFT != address(0)) {
            Match storage m = matches[room.matchId];
            string memory predictionText = string(abi.encodePacked(
                _uintToString(_predictedHomeScore),
                " - ",
                _uintToString(_predictedAwayScore)
            ));
            
            string memory outcomeStr = "DRAW";
            if (_predictedResult == MatchResult.HOME_WIN) outcomeStr = "HOME_WIN";
            else if (_predictedResult == MatchResult.AWAY_WIN) outcomeStr = "AWAY_WIN";
            
            tokenId = IPredictionNFT(predictionNFT).mint(
                msg.sender,
                _roomId,
                room.matchId,
                m.homeTeam,
                m.awayTeam,
                predictionText,
                outcomeStr,
                msg.value
            );
        }

        predictions[_roomId][msg.sender] = Prediction({
            predictor: msg.sender,
            predictedResult: _predictedResult,
            predictedHomeScore: _predictedHomeScore,
            predictedAwayScore: _predictedAwayScore,
            stakeAmount: msg.value,
            claimed: false,
            points: 0,
            nftTokenId: tokenId
        });

        roomPredictors[_roomId].push(msg.sender);
        room.totalPool += msg.value;

        // Squad prediction stats
        uint256 squadId = userSquad[msg.sender];
        if (squadId != 0) {
            squads[squadId].totalPredictions++;
        }

        emit PredictionMade(_roomId, msg.sender, _predictedResult, msg.value, tokenId);
    }

    // ============================================================
    //                   RESOLUTION & PAYOUTS
    // ============================================================

    /**
     * @notice Resolve a room and calculate points after match is resolved
     */
    function resolveRoom(uint256 _roomId) external roomExists(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.status != RoomStatus.RESOLVED, "Already resolved");
        
        Match storage m = matches[room.matchId];
        require(m.resolved, "Match not resolved yet");

        room.status = RoomStatus.RESOLVED;

        address[] storage predictors = roomPredictors[_roomId];
        uint256 totalWeightedPoints = 0;
        uint256 winnerCount = 0;

        // Phase 1: Calculate points for all predictors
        for (uint256 i = 0; i < predictors.length; i++) {
            Prediction storage pred = predictions[_roomId][predictors[i]];
            uint256 points = 0;
            bool isWinner = false;

            if (pred.predictedResult == m.result) {
                points = 3; // Correct result
                winnerCount++;
                isWinner = true;

                // Exact score bonus
                if (pred.predictedHomeScore == m.homeScore && 
                    pred.predictedAwayScore == m.awayScore) {
                    points = 8; // 3 + 5 bonus
                }
            }

            pred.points = points;
            totalWeightedPoints += points * pred.stakeAmount;

            // Update dynamic NFT
            if (predictionNFT != address(0) && pred.nftTokenId != 0) {
                IPredictionNFT(predictionNFT).resolve(pred.nftTokenId, points, isWinner);
            }

            // Update global leaderboard
            leaderboard[predictors[i]].totalPoints += points;
            if (points > 0) {
                leaderboard[predictors[i]].correctPredictions++;
            }

            // Update Squad Points
            uint256 squadId = userSquad[predictors[i]];
            if (squadId != 0) {
                squads[squadId].totalPoints += points;
            }
        }

        // Phase 2: Calculate and store payouts
        uint256 platformFee = (room.totalPool * platformFeeBps) / 10000;
        uint256 distributablePool = room.totalPool - platformFee;
        platformFeesCollected += platformFee;

        if (totalWeightedPoints == 0) {
            // No winners — refund everyone (minus fee)
            uint256 refundPool = distributablePool;
            for (uint256 i = 0; i < predictors.length; i++) {
                Prediction storage pred = predictions[_roomId][predictors[i]];
                pred.points = 0; // Mark as refund scenario
                pred.claimed = false;
            }
        }

        emit RoomResolved(_roomId, room.totalPool, winnerCount);
    }

    /**
     * @notice Claim winnings from a resolved room
     */
    function claimWinnings(uint256 _roomId) external roomExists(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.status == RoomStatus.RESOLVED, "Room not resolved");

        Prediction storage pred = predictions[_roomId][msg.sender];
        require(pred.stakeAmount > 0, "No prediction found");
        require(!pred.claimed, "Already claimed");

        pred.claimed = true;

        Match storage m = matches[room.matchId];
        uint256 payout = _calculatePayout(_roomId, msg.sender, m);

        if (payout > 0) {
            leaderboard[msg.sender].totalWinnings += payout;
            
            // Update squad statistics
            uint256 squadId = userSquad[msg.sender];
            if (squadId != 0) {
                squads[squadId].totalWinnings += payout;
            }

            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Transfer failed");
        }

        emit WinningsClaimed(_roomId, msg.sender, payout);
    }

    function _calculatePayout(
        uint256 _roomId,
        address _user,
        Match storage m
    ) internal view returns (uint256) {
        Room storage room = rooms[_roomId];
        Prediction storage pred = predictions[_roomId][_user];

        uint256 platformFee = (room.totalPool * platformFeeBps) / 10000;
        uint256 distributablePool = room.totalPool - platformFee;

        // Calculate total weighted points
        address[] storage predictors = roomPredictors[_roomId];
        uint256 totalWeightedPoints = 0;

        for (uint256 i = 0; i < predictors.length; i++) {
            Prediction storage p = predictions[_roomId][predictors[i]];
            if (p.predictedResult == m.result) {
                uint256 pts = 3;
                if (p.predictedHomeScore == m.homeScore && 
                    p.predictedAwayScore == m.awayScore) {
                    pts = 8;
                }
                totalWeightedPoints += pts * p.stakeAmount;
            }
        }

        if (totalWeightedPoints == 0) {
            // Refund scenario
            return (pred.stakeAmount * distributablePool) / room.totalPool;
        }

        if (pred.predictedResult != m.result) {
            return 0; // Loser gets nothing
        }

        uint256 userPoints = 3;
        if (pred.predictedHomeScore == m.homeScore && 
            pred.predictedAwayScore == m.awayScore) {
            userPoints = 8;
        }

        uint256 userWeighted = userPoints * pred.stakeAmount;
        return (userWeighted * distributablePool) / totalWeightedPoints;
    }

    // ============================================================
    //                      SQUAD MANAGEMENT
    // ============================================================

    /**
     * @notice Create a named squad (GameFi fantasy representation)
     */
    function createSquad(string calldata _name) external {
        require(userSquad[msg.sender] == 0, "Already in a squad");
        require(bytes(_name).length > 0 && bytes(_name).length <= 32, "Invalid name length");
        
        uint256 squadId = nextSquadId++;
        
        squads[squadId] = Squad({
            squadId: squadId,
            name: _name,
            captain: msg.sender,
            memberCount: 1,
            totalPredictions: 0,
            totalPoints: 0,
            totalWinnings: 0
        });
        
        userSquad[msg.sender] = squadId;
        squadMembers[squadId].push(msg.sender);
        squadIds.push(squadId);
        
        emit SquadCreated(squadId, _name, msg.sender);
    }

    /**
     * @notice Join an existing squad
     */
    function joinSquad(uint256 _squadId) external {
        require(userSquad[msg.sender] == 0, "Already in a squad");
        require(squads[_squadId].squadId != 0, "Squad not found");
        
        userSquad[msg.sender] = _squadId;
        squadMembers[_squadId].push(msg.sender);
        squads[_squadId].memberCount++;
        
        emit SquadJoined(_squadId, msg.sender);
    }

    // ============================================================
    //                      VIEW FUNCTIONS
    // ============================================================

    function getRoomMembers(uint256 _roomId) external view returns (address[] memory) {
        return roomMembers[_roomId];
    }

    function getRoomPredictors(uint256 _roomId) external view returns (address[] memory) {
        return roomPredictors[_roomId];
    }

    function getPrediction(uint256 _roomId, address _user) external view returns (Prediction memory) {
        return predictions[_roomId][_user];
    }

    function getMatch(uint256 _matchId) external view returns (Match memory) {
        return matches[_matchId];
    }

    function getRoom(uint256 _roomId) external view returns (Room memory) {
        return rooms[_roomId];
    }

    function getAllMatchIds() external view returns (uint256[] memory) {
        return matchIds;
    }

    function getAllRoomIds() external view returns (uint256[] memory) {
        return roomIds;
    }

    function getLeaderboardEntry(address _player) external view returns (LeaderboardEntry memory) {
        return leaderboard[_player];
    }

    function getLeaderboardSize() external view returns (uint256) {
        return leaderboardPlayers.length;
    }

    /**
     * @notice Get top N players from the leaderboard
     */
    function getTopPlayers(uint256 _count) external view returns (LeaderboardEntry[] memory) {
        uint256 count = _count > leaderboardPlayers.length ? leaderboardPlayers.length : _count;
        
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](leaderboardPlayers.length);
        for (uint256 i = 0; i < leaderboardPlayers.length; i++) {
            entries[i] = leaderboard[leaderboardPlayers[i]];
        }

        for (uint256 i = 0; i < entries.length; i++) {
            for (uint256 j = i + 1; j < entries.length; j++) {
                if (entries[j].totalPoints > entries[i].totalPoints) {
                    LeaderboardEntry memory temp = entries[i];
                    entries[i] = entries[j];
                    entries[j] = temp;
                }
            }
        }

        LeaderboardEntry[] memory top = new LeaderboardEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            top[i] = entries[i];
        }
        return top;
    }

    /**
     * @notice Get top N squads from the leaderboard
     */
    function getTopSquads(uint256 _count) external view returns (Squad[] memory) {
        uint256 count = _count > squadIds.length ? squadIds.length : _count;
        
        Squad[] memory entries = new Squad[](squadIds.length);
        for (uint256 i = 0; i < squadIds.length; i++) {
            entries[i] = squads[squadIds[i]];
        }

        for (uint256 i = 0; i < entries.length; i++) {
            for (uint256 j = i + 1; j < entries.length; j++) {
                if (entries[j].totalPoints > entries[i].totalPoints) {
                    Squad memory temp = entries[i];
                    entries[i] = entries[j];
                    entries[j] = temp;
                }
            }
        }

        Squad[] memory top = new Squad[](count);
        for (uint256 i = 0; i < count; i++) {
            top[i] = entries[i];
        }
        return top;
    }

    function getRoomsByMatch(uint256 _matchId) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < roomIds.length; i++) {
            if (rooms[roomIds[i]].matchId == _matchId) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < roomIds.length; i++) {
            if (rooms[roomIds[i]].matchId == _matchId) {
                result[idx++] = roomIds[i];
            }
        }
        return result;
    }

    function getUserRooms(address _user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < roomIds.length; i++) {
            if (isRoomMember[roomIds[i]][_user]) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < roomIds.length; i++) {
            if (isRoomMember[roomIds[i]][_user]) {
                result[idx++] = roomIds[i];
            }
        }
        return result;
    }

    function getSquadMembers(uint256 _squadId) external view returns (address[] memory) {
        return squadMembers[_squadId];
    }

    // ============================================================
    //                   ADMIN FUNCTIONS
    // ============================================================

    function setPredictionNFT(address _predictionNFT) external onlyOwner {
        predictionNFT = _predictionNFT;
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = platformFeesCollected;
        platformFeesCollected = 0;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function updatePlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = _newFeeBps;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    function _uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 temp = v;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (v != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint8(v % 10)));
            v /= 10;
        }
        return string(buffer);
    }

    receive() external payable {}
}
