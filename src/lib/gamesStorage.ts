// src/lib/gamesStorage.ts
// Simple local storage solution for games

// export interface Game {
//   id: string;
//   name: string;
//   duration: number;
//   depositAmount: string;
//   creatorFid: number;
//   players: Array<{
//     fid: number;
//     depositAmount: string;
//     hasDeposited: boolean;
//   }>;
//   status: 'pending' | 'active' | 'completed';
//   createdAt: string;
//   startsAt: string | null;
//   endsAt: string | null;
//   totalPot: number;
//   currentYield: number;
//   winner: number | null;
// }

// // Get all games from local storage
// export function getGames(): Game[] {
//   if (typeof window === 'undefined') return [];
//   const gamesJson = localStorage.getItem('friendsNFundsGames');
//   return gamesJson ? JSON.parse(gamesJson) : [];
// }

// // Save games to local storage
// export function saveGames(games: Game[]): void {
//   if (typeof window === 'undefined') return;
//   localStorage.setItem('friendsNFundsGames', JSON.stringify(games));
// }

// // Create a new game
// export function createGame(
//   name: string,
//   duration: number,
//   depositAmount: string,
//   creatorFid: number
// ): Game {
//   const game: Game = {
//     id: Math.random().toString(36).substring(7),
//     name,
//     duration,
//     depositAmount,
//     creatorFid,
//     players: [{
//       fid: creatorFid,
//       depositAmount,
//       hasDeposited: false
//     }],
//     status: 'pending',
//     createdAt: new Date().toISOString(),
//     startsAt: null,
//     endsAt: null,
//     totalPot: 0,
//     currentYield: Math.random() * 20, // Mock yield for demo
//     winner: null
//   };

//   const games = getGames();
//   games.push(game);
//   saveGames(games);
  
//   return game;
// }

// // Join a game
// export function joinGame(gameId: string, playerFid: number): Game | null {
//   const games = getGames();
//   const game = games.find(g => g.id === gameId);
  
//   if (!game || game.status !== 'pending') {
//     return null;
//   }
  
//   // Check if player already joined
//   if (game.players.find(p => p.fid === playerFid)) {
//     return null;
//   }
  
//   game.players.push({
//     fid: playerFid,
//     depositAmount: game.depositAmount,
//     hasDeposited: false
//   });
  
//   saveGames(games);
//   return game;
// }

// // Get games for a specific user
// export function getUserGames(userFid: number): Game[] {
//   const games = getGames();
//   return games.filter(game => 
//     game.players.some(player => player.fid === userFid)
//   );
// }