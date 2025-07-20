"use client";

import { useState, useEffect } from "react";
import { getUserGames } from '~/lib/gameStorageSupabase';
import { useMiniApp } from "@neynar/react";
import { GameDeposit } from '~/components/GameDeposit';
import { supabase } from "~/lib/supabase";

export function HomeTab() {
  const { context } = useMiniApp();
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    const loadGames = async () => {
      try {
        // For production without Farcaster context, just load ALL games
        const { data: allGames, error } = await supabase
          .from('games')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("Loaded games:", allGames);
        
        if (error) {
          console.error("Error loading games:", error);
          setDebugInfo(`Error: ${error.message}`);
          return;
        }
        
        setDebugInfo(`Loaded ${allGames?.length || 0} games`);
        setGames(allGames || []);
        
      } catch (error) {
        setDebugInfo(`Error: ${error}`);
        console.error("Error:", error);
      }
    };
    
    loadGames();
  }, []); // No dependencies - just load on mount
  // useEffect(() => {
  //   // Load games for current user
  //   const loadGames = async () => {
  //     if (context?.user?.fid) {
  //       const userGames = await getUserGames(context.user.fid);
  //       setGames(userGames);
  //     }
  //   };
  //   loadGames();
  // }, [context?.user?.fid]);

  // Calculate totals
  const totalDeposited = games.reduce((sum, game) => {
    const playerDeposit = parseFloat(game.depositAmount) || 0;
    return sum + playerDeposit;
  }, 0);

  const potentialWinnings = games.reduce((sum, game) => {
    return sum + (game.currentYield || 0);
  }, 0);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Active Games</h2>
        <p className="text-gray-600">Compete for yield with friends!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Deposited</p>
          <p className="text-xl font-bold">${totalDeposited}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Potential Winnings</p>
          <p className="text-xl font-bold">${potentialWinnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Active Games</h3>
        {games.map((game) => (
          <div key={game.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{game.name}</h4>
                <p className="text-sm text-gray-600">
                  {game.players.length} players • {game.duration} days • Code: {game.id}
                </p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                {game.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Your Deposit: </span>
                <span className="font-medium">${game.depositAmount}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Yield: </span>
                <span className="font-medium text-green-600">${game.currentYield.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(game.id);
                  alert(`Copied invite code: ${game.id}`);
                }}
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Copy Invite Code
              </button>
              <button className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                View Players ({game.players.length})
              </button>
            </div>
            
            {/* Add deposit section for pending games */}
            {game.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Ready to start? Deposit to play!</p>
                <GameDeposit
                  gameId={game.id}
                  depositAmount={game.deposit_amount.toString()}
                  playerFid={context?.user?.fid || 0}
                  onSuccess={async () => {
                    // Refresh games
                    if (context?.user?.fid) {
                      const userGames = await getUserGames(context.user.fid);
                      setGames(userGames);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No active games yet!</p>
          <p className="text-sm text-gray-500 mb-4">Go to Actions tab to create your first game</p>
        </div>
      )}
    </div>
  );
}

function setDebugInfo(arg0: string) {
  throw new Error("Function not implemented.");
}
