// src/components/GameDeposit.tsx
"use client";

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { depositFunds } from '~/lib/gameStorageSupabase';
import { Button } from './ui/Button';

interface GameDepositProps {
  gameId: string;
  depositAmount: string; // in ETH/USDC
  playerFid: number;
  onSuccess?: () => void;
}

export function GameDeposit({ gameId, depositAmount, playerFid, onSuccess }: GameDepositProps) {
  const { address, isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { 
    sendTransaction,
    isPending: isSending,
    error: sendError
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleDeposit = async () => {
    if (!address || !isConnected) return;
    
    try {
      // For demo, we'll send ETH to a dummy address
      // In production, this would be your smart contract
      const GAME_CONTRACT = '0x0000000000000000000000000000000000000001'; // Replace with real contract
      
      // Send transaction
      sendTransaction(
        {
          to: GAME_CONTRACT as `0x${string}`,
          value: parseEther(depositAmount),
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
            // Save to database
            depositFunds(gameId, playerFid, address, hash).then(() => {
              onSuccess?.();
            });
          },
        }
      );
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Connect wallet to deposit</p>
        <Button 
          onClick={() => window.location.href = '/?tab=wallet'}
          className="text-sm"
        >
          Go to Wallet Tab
        </Button>
      </div>
    );
  }

  const buttonText = () => {
    if (isSending) return 'Confirm in wallet...';
    if (isConfirming) return 'Depositing...';
    if (isSuccess) return 'Deposit complete! ✅';
    return `Deposit ${depositAmount} ETH`;
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        <p>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <p>Amount: {depositAmount} ETH</p>
      </div>
      
      <Button
        onClick={handleDeposit}
        disabled={isSending || isConfirming || isSuccess}
        isLoading={isSending || isConfirming}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {buttonText()}
      </Button>
      
      {sendError && (
        <p className="text-red-500 text-sm">
          Error: {sendError.message}
        </p>
      )}
      
      {txHash && (
        <p className="text-xs text-gray-600">
          Tx: {txHash.slice(0, 10)}...
        </p>
      )}
    </div>
  );
}