// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        uint256 len = data.length;
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        bytes memory table = TABLE;
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (; i + 3 <= len; i += 3) {
            result[j]     = table[uint8(data[i] >> 2)];
            result[j + 1] = table[uint8(((data[i] & 0x03) << 4) | (data[i + 1] >> 4))];
            result[j + 2] = table[uint8(((data[i + 1] & 0x0F) << 2) | (data[i + 2] >> 6))];
            result[j + 3] = table[uint8(data[i + 2] & 0x3F)];
            j += 4;
        }
        
        if (i < len) {
            result[j] = table[uint8(data[i] >> 2)];
            if (i + 1 == len) {
                result[j + 1] = table[uint8((data[i] & 0x03) << 4)];
                result[j + 2] = "=";
                result[j + 3] = "=";
            } else {
                result[j + 1] = table[uint8(((data[i] & 0x03) << 4) | (data[i + 1] >> 4))];
                result[j + 2] = table[uint8((data[i + 1] & 0x0F) << 2)];
                result[j + 3] = "=";
            }
        }
        
        return string(result);
    }
}

contract PredictionNFT {
    // Basic ERC721 state and metadata
    string public constant name = "MatchStake Prediction Ticket";
    string public constant symbol = "MSPT";
    
    address public immutable matchStakeContract;
    uint256 public nextTokenId = 1;
    
    struct NFTData {
        uint256 roomId;
        uint256 matchId;
        string homeTeam;
        string awayTeam;
        string predictionText; // e.g. "USA 2 - 1 Morocco"
        string predictedOutcome; // "HOME_WIN", "AWAY_WIN", "DRAW"
        uint256 stakeAmount;
        uint256 pointsEarned;
        bool resolved;
        bool isWinner;
    }
    
    mapping(uint256 => NFTData) public nftData;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    
    // Reverse mappings to list user NFTs
    mapping(address => uint256[]) private _userTokens;
    mapping(uint256 => uint256) private _userTokenIndex;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    
    modifier onlyMatchStake() {
        require(msg.sender == matchStakeContract, "Only MatchStake allowed");
        _;
    }
    
    constructor(address _matchStakeContract) {
        matchStakeContract = _matchStakeContract;
    }
    
    function mint(
        address to,
        uint256 roomId,
        uint256 matchId,
        string calldata homeTeam,
        string calldata awayTeam,
        string calldata predictionText,
        string calldata predictedOutcome,
        uint256 stakeAmount
    ) external onlyMatchStake returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        _owners[tokenId] = to;
        _balances[to]++;
        
        // Track for listAll function
        _userTokenIndex[tokenId] = _userTokens[to].length;
        _userTokens[to].push(tokenId);
        
        nftData[tokenId] = NFTData({
            roomId: roomId,
            matchId: matchId,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            predictionText: predictionText,
            predictedOutcome: predictedOutcome,
            stakeAmount: stakeAmount,
            pointsEarned: 0,
            resolved: false,
            isWinner: false
        });
        
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }
    
    function resolve(
        uint256 tokenId,
        uint256 pointsEarned,
        bool isWinner
    ) external onlyMatchStake {
        require(nftData[tokenId].roomId != 0, "Token does not exist");
        NFTData storage data = nftData[tokenId];
        data.pointsEarned = pointsEarned;
        data.isWinner = isWinner;
        data.resolved = true;
    }
    
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token not found");
        return owner;
    }
    
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Address zero");
        return _balances[owner];
    }
    
    function getUserTokens(address user) external view returns (uint256[] memory) {
        return _userTokens[user];
    }
    
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token not found");
        NFTData memory data = nftData[tokenId];
        
        string memory statusText = "PENDING";
        string memory accentColor = "#f59e0b"; // gold
        
        if (data.resolved) {
            statusText = data.isWinner ? "WINNER" : "COMPLETED";
            accentColor = data.isWinner ? "#22c55e" : "#ef4444"; // green for win, red for loss
        }
        
        // Generate SVG on-chain
        string memory svg = string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 550' width='100%' height='100%'>",
            "<rect width='400' height='550' fill='#000000' stroke='", accentColor, "' stroke-width='3'/>",
            "<line x1='20' y1='60' x2='380' y2='60' stroke='#ffffff' stroke-width='0.5' stroke-dasharray='4'/>",
            "<line x1='20' y1='490' x2='380' y2='490' stroke='#ffffff' stroke-width='0.5' stroke-dasharray='4'/>",
            "<text x='30' y='45' fill='", accentColor, "' font-family='monospace' font-size='12' letter-spacing='2'>MATCHSTAKE PROOF OF STAKE</text>",
            "<text x='30' y='110' fill='#ffffff' font-family='sans-serif' font-size='22' font-weight='800' letter-spacing='-1'>", data.homeTeam, " vs ", data.awayTeam, "</text>",
            "<text x='30' y='160' fill='rgba(255,255,255,0.4)' font-family='monospace' font-size='11' letter-spacing='1'>PREDICTION</text>",
            "<text x='30' y='190' fill='#ffffff' font-family='monospace' font-size='16' font-weight='700'>", data.predictionText, " (", data.predictedOutcome, ")</text>",
            "<text x='30' y='240' fill='rgba(255,255,255,0.4)' font-family='monospace' font-size='11' letter-spacing='1'>STAKE AMOUNT</text>",
            "<text x='30' y='270' fill='#ffffff' font-family='monospace' font-size='16'>", _uintToString(data.stakeAmount / 1e15), " mOKB</text>",
            "<text x='30' y='320' fill='rgba(255,255,255,0.4)' font-family='monospace' font-size='11' letter-spacing='1'>ROOM ID</text>",
            "<text x='30' y='345' fill='#ffffff' font-family='monospace' font-size='14'>#", _uintToString(data.roomId), "</text>"
        ));

        svg = string(abi.encodePacked(
            svg,
            "<text x='30' y='390' fill='rgba(255,255,255,0.4)' font-family='monospace' font-size='11' letter-spacing='1'>STATUS</text>",
            "<text x='30' y='420' fill='", accentColor, "' font-family='monospace' font-size='20' font-weight='800' letter-spacing='2'>", statusText, "</text>",
            "<text x='30' y='455' fill='#ffffff' font-family='monospace' font-size='12'>POINTS EARNED: ", _uintToString(data.pointsEarned), "</text>",
            "<text x='30' y='520' fill='rgba(255,255,255,0.3)' font-family='monospace' font-size='10' letter-spacing='1'>BUILT ON X LAYER // OKX X CUP 2026</text>",
            "</svg>"
        ));
        
        string memory json = string(abi.encodePacked(
            '{"name": "Prediction Ticket #', _uintToString(tokenId), '", ',
            '"description": "World Cup 2026 Watch Party Prediction Ticket", ',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '", ',
            '"attributes": [',
                '{"trait_type": "Resolved", "value": "', data.resolved ? "true" : "false", '"}, ',
                '{"trait_type": "Points", "value": ', _uintToString(data.pointsEarned), '}, ',
                '{"trait_type": "Winner", "value": "', data.isWinner ? "true" : "false", '"}',
            ']}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
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
}
