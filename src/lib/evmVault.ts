export const VAULT_ADDRESS = "0x48f98337D70B39B9b13612a14F9d7072bcAC8B28";

export const VAULT_ABI = [
  {
    "inputs": [],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "depositERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 