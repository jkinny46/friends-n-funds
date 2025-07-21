// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract FriendsNFundsGameVault {
    enum GameStatus { Pending, Active, Completed }

    struct Game {
        address creator;
        address[] invitedPlayers;
        address[] joinedPlayers;
        uint256 stakeAmount;
        uint256 joinDeadline;
        GameStatus status;
        address winner;
        uint256 totalPool;
        address depositToken; // address(0) for ETH, otherwise ERC-20 token address
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public ethBalances;
    mapping(address => mapping(address => uint256)) public erc20Balances; // user => token => amount
    uint256 public nextGameId;

    event DepositETH(address indexed user, uint256 amount);
    event DepositERC20(address indexed user, address indexed token, uint256 amount);
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 stakeAmount, uint256 joinDeadline, address depositToken);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameLocked(uint256 indexed gameId, uint256 totalPool);
    event WinnerSet(uint256 indexed gameId, address indexed winner);

    // General ETH deposit (for pre-funding)
    function depositETH() external payable {
        require(msg.value > 0, "No ETH sent");
        ethBalances[msg.sender] += msg.value;
        emit DepositETH(msg.sender, msg.value);
    }

    // General ERC20 deposit (for pre-funding)
    function depositERC20(address token, uint256 amount) external {
        require(amount > 0, "No tokens sent");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        erc20Balances[msg.sender][token] += amount;
        emit DepositERC20(msg.sender, token, amount);
    }

    // Create a new game and deposit stake (ETH or ERC-20)
    function createGame(
        address[] calldata invited,
        uint256 stakeAmount,
        uint256 joinWindowSeconds,
        address depositToken // address(0) for ETH, or ERC-20 token address
    ) external payable {
        if (depositToken == address(0)) {
            require(msg.value == stakeAmount, "Must deposit exact ETH stake");
        } else {
            require(msg.value == 0, "ETH not allowed for ERC-20 game");
            require(IERC20(depositToken).transferFrom(msg.sender, address(this), stakeAmount), "ERC-20 transfer failed");
        }
        uint256 gameId = nextGameId++;
        Game storage game = games[gameId];
        game.creator = msg.sender;
        game.invitedPlayers = invited;
        game.stakeAmount = stakeAmount;
        game.joinDeadline = block.timestamp + joinWindowSeconds;
        game.status = GameStatus.Pending;
        game.joinedPlayers.push(msg.sender);
        game.depositToken = depositToken;
        if (depositToken == address(0)) {
            game.totalPool = msg.value;
        } else {
            game.totalPool = stakeAmount;
        }
        emit GameCreated(gameId, msg.sender, stakeAmount, game.joinDeadline, depositToken);
    }

    // Join a game by depositing the stake (ETH or ERC-20)
    function joinGame(uint256 gameId) external payable {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Pending, "Game not joinable");
        require(block.timestamp < game.joinDeadline, "Join window closed");
        require(game.depositToken == address(0) ? msg.value == game.stakeAmount : msg.value == 0, "Incorrect ETH value");
        // Check if invited
        bool invited = false;
        for (uint i = 0; i < game.invitedPlayers.length; i++) {
            if (game.invitedPlayers[i] == msg.sender) {
                invited = true;
                break;
            }
        }
        require(invited, "Not invited");
        // Check not already joined
        for (uint i = 0; i < game.joinedPlayers.length; i++) {
            require(game.joinedPlayers[i] != msg.sender, "Already joined");
        }
        game.joinedPlayers.push(msg.sender);
        if (game.depositToken == address(0)) {
            game.totalPool += msg.value;
        } else {
            require(IERC20(game.depositToken).transferFrom(msg.sender, address(this), game.stakeAmount), "ERC-20 transfer failed");
            game.totalPool += game.stakeAmount;
        }
        emit PlayerJoined(gameId, msg.sender);
    }

    // Lock the game after join window
    function lockGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(block.timestamp >= game.joinDeadline, "Join window not closed");
        require(game.status == GameStatus.Pending, "Already locked");
        game.status = GameStatus.Active;
        emit GameLocked(gameId, game.totalPool);
        // (Aave integration would go here)
    }

    // Set winner and allow withdrawal (admin or creator for now)
    function setWinner(uint256 gameId, address winner) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");
        // (Add access control here)
        game.status = GameStatus.Completed;
        game.winner = winner;
        // (Payout logic would go here)
        emit WinnerSet(gameId, winner);
    }

    // Withdraw winnings (to be implemented)
    // function withdraw(...) external { ... }
}