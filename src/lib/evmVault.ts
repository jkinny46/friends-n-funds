export const VAULT_ADDRESS = "0xdb3297c61c3b15b66668eefd0c85e9a1788bfb547816f39e5b24a18663e1cdb3";

export const VAULT_ABI = [
  // General ETH deposit
  {
    "inputs": [],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // General ERC20 deposit
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "depositERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Create game
  {
    "inputs": [
      { "internalType": "address[]", "name": "invited", "type": "address[]" },
      { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "joinWindowSeconds", "type": "uint256" },
      { "internalType": "address", "name": "depositToken", "type": "address" }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Join game
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Lock game
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "lockGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Set winner
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "address", "name": "winner", "type": "address" }
    ],
    "name": "setWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 