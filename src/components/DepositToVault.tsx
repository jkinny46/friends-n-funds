import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VAULT_ADDRESS, VAULT_ABI } from "../lib/evmVault";

// Example ERC-20 testnet addresses (replace with real ones for Sepolia)
const TOKENS = [
  { symbol: "ETH", address: "0x0000000000000000000000000000000000000000" },
  { symbol: "USDC", address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f" }, // Sepolia USDC
  { symbol: "USDT", address: "0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136" }, // Sepolia USDT
];

export function DepositToVault() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(TOKENS[0].address);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContract, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  const handleDeposit = async () => {
    if (!amount) return;
    if (token === TOKENS[0].address) {
      // ETH deposit
      writeContract(
        {
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "depositETH",
          value: BigInt(Number(amount) * 1e18),
        },
        {
          onSuccess: (hash) => setTxHash(hash),
        }
      );
    } else {
      // ERC-20 deposit
      writeContract(
        {
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "depositERC20",
          args: [token, BigInt(Number(amount) * 1e6)], // USDC/USDT usually 6 decimals
        },
        {
          onSuccess: (hash) => setTxHash(hash),
        }
      );
    }
  };

  return (
    <div className="p-4 border rounded mb-4">
      <h3 className="font-semibold mb-2">Deposit to Vault</h3>
      <div className="mb-2">
        <select value={token} onChange={e => setToken(e.target.value)} className="border p-2 rounded mr-2">
          {TOKENS.map(t => (
            <option key={t.address} value={t.address}>{t.symbol}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder={`Amount in ${TOKENS.find(t => t.address === token)?.symbol}`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleDeposit}
          disabled={!isConnected || isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isPending ? "Depositing..." : "Deposit"}
        </button>
      </div>
      {txHash && (
        <div className="mt-2 text-xs">
          {isSuccess ? (
            <span className="text-green-600">Deposit successful!</span>
          ) : (
            <span>Transaction sent: {txHash.slice(0, 10)}...</span>
          )}
        </div>
      )}
    </div>
  );
} 