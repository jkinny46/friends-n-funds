"use client";

import { useState, useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { GameDeposit } from '~/components/GameDeposit';
import { supabase } from "~/lib/supabase";

export function HomeTab() {
  const { context } = useMiniApp();
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    const loadGames = async () => {
      try {
        // Fetch games with their players
        const { data: allGames, error } = await supabase
          .from('games')
          .select('*, game_players(*)')
          .order('created_at', { ascending: false });
        if (error) {
          console.error("Error loading games:", error);
          return;
        }
        setGames(allGames || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    loadGames();
  }, []);

  // Calculate totals
  const totalDeposited = games.reduce((sum, game) => {
    const playerDeposit = parseFloat(game.deposit_amount) || 0;
    return sum + playerDeposit;
  }, 0);

  const potentialWinnings = games.reduce((sum, game) => {
    return sum + (game.current_yield || 0);
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
                  {game.game_players?.length || 0} players • {game.duration_days} days • Code: {game.invite_code}
                </p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                {game.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Deposit: </span>
                <span className="font-medium">${game.deposit_amount}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Yield: </span>
                <span className="font-medium text-green-600">${game.current_yield?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(game.invite_code);
                  alert(`Copied invite code: ${game.invite_code}`);
                }}
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Copy Invite Code
              </button>
              <button className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                View Players ({game.game_players?.length || 0})
              </button>
            </div>
            {/* Add deposit section for pending games */}
            {game.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Ready to start? Deposit to play!</p>
                <GameDeposit
                  gameId={game.id}
                  depositAmount={game.deposit_amount?.toString() || '0'}
                  playerFid={context?.user?.fid || 0}
                  onSuccess={async () => {
                    // Refresh games
                    const { data: allGames, error } = await supabase
                      .from('games')
                      .select('*, game_players(*)')
                      .order('created_at', { ascending: false });
                    setGames(allGames || []);
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
