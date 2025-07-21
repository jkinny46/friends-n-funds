import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VAULT_ADDRESS, VAULT_ABI } from "../lib/evmVault";

export function DepositToVault() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContract, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleDeposit = async () => {
    if (!amount) return;
    writeContract(
      {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "depositETH",
        value: BigInt(Number(amount) * 1e18), // ETH to wei
      },
      {
        onSuccess: (hash) => setTxHash(hash),
      }
    );
  };

  return (
    <div className="p-4 border rounded mb-4">
      <h3 className="font-semibold mb-2">Deposit ETH to Vault</h3>
      <input
        type="number"
        placeholder="Amount in ETH"
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