"use client";

import { useCallback, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "../Share";
import { Button } from "../Button";
import { SignIn } from "../wallet/SignIn";
import { type Haptics } from "@farcaster/miniapp-sdk";
import { createGame, joinGame } from '~/lib/gamesStorage';

export function ActionsTab() {
  // --- Original Hooks ---
  const {
    actions,
    added,
    notificationDetails,
    haptics,
    context,
  } = useMiniApp();
  
  // --- Original State ---
  const [notificationState, setNotificationState] = useState({
    sendStatus: "",
    shareUrlCopied: false,
  });
  const [selectedHapticIntensity, setSelectedHapticIntensity] = useState<Haptics.ImpactOccurredType>('medium');

  // --- NEW State for Friends n Funds ---
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);
  const [gameFormData, setGameFormData] = useState({
    name: '',
    duration: '7',
    depositAmount: '100',
    inviteCode: ''
  });

  // --- Original Handlers ---
  const sendFarcasterNotification = useCallback(async () => {
    setNotificationState((prev) => ({ ...prev, sendStatus: "" }));
    if (!notificationDetails || !context) {
      return;
    }
    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });
      if (response.status === 200) {
        setNotificationState((prev) => ({ ...prev, sendStatus: "Success" }));
        return;
      } else if (response.status === 429) {
        setNotificationState((prev) => ({ ...prev, sendStatus: "Rate limited" }));
        return;
      }
      const responseText = await response.text();
      setNotificationState((prev) => ({ ...prev, sendStatus: `Error: ${responseText}` }));
    } catch (error) {
      setNotificationState((prev) => ({ ...prev, sendStatus: `Error: ${error}` }));
    }
  }, [context, notificationDetails]);

  const copyUserShareUrl = useCallback(async () => {
    if (context?.user?.fid) {
      const userShareUrl = `${process.env.NEXT_PUBLIC_URL}/share/${context.user.fid}`;
      await navigator.clipboard.writeText(userShareUrl);
      setNotificationState((prev) => ({ ...prev, shareUrlCopied: true }));
      setTimeout(() => setNotificationState((prev) => ({ ...prev, shareUrlCopied: false })), 2000);
    }
  }, [context?.user?.fid]);

  const triggerHapticFeedback = useCallback(async () => {
    try {
      await haptics.impactOccurred(selectedHapticIntensity);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, [haptics, selectedHapticIntensity]);

  // --- NEW Game Handlers with Local Storage ---
  const handleCreateGame = async () => {
    try {
      const game = createGame(
        gameFormData.name,
        parseInt(gameFormData.duration),
        gameFormData.depositAmount,
        context?.user?.fid || 0
      );
      
      alert(`Game created! Invite code: ${game.id}`);
      setShowCreateGame(false);
      setGameFormData({ ...gameFormData, name: '' });
      
      // Optionally navigate to home to see the new game
      window.location.href = '/';
    } catch (error) {
      alert('Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    try {
      const game = joinGame(
        gameFormData.inviteCode,
        context?.user?.fid || 0
      );
      
      if (game) {
        alert(`Joined ${game.name}! Deposit ${game.depositAmount} to start playing.`);
        setShowJoinGame(false);
        setGameFormData({ ...gameFormData, inviteCode: '' });
        
        // Optionally navigate to home to see the game
        window.location.href = '/';
      } else {
        alert('Invalid game code or already joined');
      }
    } catch (error) {
      alert('Failed to join game');
    }
  };

  // --- Render ---
  return (
    <div className="space-y-3 px-6 w-full max-w-md mx-auto">
      {/* Friends n Funds Game Actions Section */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">🎮 Game Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setShowCreateGame(true)} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Create New Game
          </button>
          
          <button 
            onClick={() => setShowJoinGame(true)} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Join Game
          </button>
          
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition-colors"
          >
            View My Active Games
          </button>
          
          <button 
            onClick={() => alert('Coming soon!')} 
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Claim Winnings
          </button>
        </div>
      </div>

      {/* Add a header for the original actions */}
      <h3 className="text-lg font-semibold mb-3">🚀 Mini App Features</h3>

      {/* Share functionality */}
      <ShareButton 
        buttonText="Share Mini App"
        cast={{
          text: "Join me on Friends n Funds - compete for yield with friends! 💰🎮",
          bestFriends: true,
          embeds: [`${process.env.NEXT_PUBLIC_URL}/share/${context?.user?.fid || ''}`]
        }}
        className="w-full"
      />

      {/* Authentication */}
      <SignIn />

      {/* Mini app actions */}
      <Button onClick={() => actions.openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")} className="w-full">Open Link</Button>

      <Button onClick={actions.addMiniApp} disabled={added} className="w-full">
        Add Mini App to Client
      </Button>

      {/* Notification functionality */}
      {notificationState.sendStatus && (
        <div className="text-sm w-full">
          Send notification result: {notificationState.sendStatus}
        </div>
      )}
      <Button onClick={sendFarcasterNotification} disabled={!notificationDetails} className="w-full">
        Send notification
      </Button>

      {/* Share URL copying */}
      <Button 
        onClick={copyUserShareUrl}
        disabled={!context?.user?.fid}
        className="w-full"
      >
        {notificationState.shareUrlCopied ? "Copied!" : "Copy share URL"}
      </Button>

      {/* Haptic feedback controls */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Haptic Intensity
        </label>
        <select
          value={selectedHapticIntensity}
          onChange={(e) => setSelectedHapticIntensity(e.target.value as Haptics.ImpactOccurredType)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={'light'}>Light</option>
          <option value={'medium'}>Medium</option>
          <option value={'heavy'}>Heavy</option>
          <option value={'soft'}>Soft</option>
          <option value={'rigid'}>Rigid</option>
        </select>
        <Button 
          onClick={triggerHapticFeedback}
          className="w-full"
        >
          Trigger Haptic Feedback
        </Button>
      </div>

      {/* Create Game Modal */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Game</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Game Name</label>
                <input
                  type="text"
                  value={gameFormData.name}
                  onChange={(e) => setGameFormData({...gameFormData, name: e.target.value})}
                  placeholder="Weekend Warriors"
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select 
                  value={gameFormData.duration}
                  onChange={(e) => setGameFormData({...gameFormData, duration: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Deposit Amount (USDC)</label>
                <input
                  type="number"
                  value={gameFormData.depositAmount}
                  onChange={(e) => setGameFormData({...gameFormData, depositAmount: e.target.value})}
                  placeholder="100"
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateGame(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGame}
                disabled={!gameFormData.name}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Game Modal */}
      {showJoinGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Join Game</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Game Code</label>
                <input
                  type="text"
                  value={gameFormData.inviteCode}
                  onChange={(e) => setGameFormData({...gameFormData, inviteCode: e.target.value})}
                  placeholder="Enter invite code..."
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowJoinGame(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinGame}
                disabled={!gameFormData.inviteCode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}