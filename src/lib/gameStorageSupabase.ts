// src/lib/gameStorageSupabase.ts
import { supabase } from './supabase'

export interface Game {
  id: string;
  name: string;
  duration_days: number;
  deposit_amount: number;
  creator_fid: number;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  starts_at: string | null;
  ends_at: string | null;
  total_pot: number;
  current_yield: number;
  winner_fid: number | null;
  invite_code: string;
  players?: GamePlayer[];
}

export interface GamePlayer {
  id: string;
  game_id: string;
  player_fid: number;
  deposit_amount: number;
  has_deposited: boolean;
  wallet_address: string | null;
  joined_at: string;
}

// Create a new game
export async function createGame(
  name: string,
  duration: number,
  depositAmount: string,
  creatorFid: number
): Promise<Game | null> {
  try {
    // Create the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        name,
        duration_days: duration,
        deposit_amount: parseFloat(depositAmount),
        creator_fid: creatorFid
      })
      .select()
      .single()

    if (gameError) throw gameError

    // Add creator as first player
    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: game.id,
        player_fid: creatorFid,
        deposit_amount: parseFloat(depositAmount)
      })

    if (playerError) throw playerError

    return game
  } catch (error) {
    console.error('Error creating game:', error)
    return null
  }
}

// Join a game
export async function joinGame(inviteCode: string, playerFid: number): Promise<Game | null> {
  try {
    // Find game by invite code
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('status', 'pending')
      .single()

    if (gameError || !game) return null

    // Check if already joined
    const { data: existingPlayer } = await supabase
      .from('game_players')
      .select('id')
      .eq('game_id', game.id)
      .eq('player_fid', playerFid)
      .single()

    if (existingPlayer) return null

    // Add player
    const { error: joinError } = await supabase
      .from('game_players')
      .insert({
        game_id: game.id,
        player_fid: playerFid,
        deposit_amount: game.deposit_amount
      })

    if (joinError) throw joinError

    return game
  } catch (error) {
    console.error('Error joining game:', error)
    return null
  }
}

// Get games for a user
export async function getUserGames(userFid: number): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players!inner(*)
      `)
      .eq('game_players.player_fid', userFid)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Error fetching games:', error)
    return []
  }
}

// Deposit funds (with wallet)
export async function depositFunds(
  gameId: string, 
  playerFid: number, 
  walletAddress: string,
  txHash: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('game_players')
      .update({ 
        has_deposited: true,
        wallet_address: walletAddress 
      })
      .eq('game_id', gameId)
      .eq('player_fid', playerFid)

    if (error) throw error

    // Check if all players deposited to start game
    const { data: players } = await supabase
      .from('game_players')
      .select('has_deposited')
      .eq('game_id', gameId)

    const allDeposited = players?.every(p => p.has_deposited)

    if (allDeposited) {
      // Start the game
      const { data: game } = await supabase
        .from('games')
        .select('duration_days')
        .eq('id', gameId)
        .single()

        if (!game) throw new Error('Game not found')

      const now = new Date()
      const endsAt = new Date(now.getTime() + (game.duration_days * 24 * 60 * 60 * 1000))

      await supabase
        .from('games')
        .update({
          status: 'active',
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString()
        })
        .eq('id', gameId)
    }

    return true
  } catch (error) {
    console.error('Error depositing funds:', error)
    return false
  }
}