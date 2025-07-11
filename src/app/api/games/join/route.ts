// src/app/api/games/join/route.ts

import { NextResponse } from 'next/server';

// This should be imported from a shared location in a real app
declare const games: any[];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inviteCode, playerFid } = body;

    // Find the game
    const game = games.find(g => g.id === inviteCode);
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check if player already joined
    const existingPlayer = game.players.find((p: any) => p.fid === playerFid);
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'You already joined this game' },
        { status: 400 }
      );
    }

    // Add player to game
    game.players.push({
      fid: playerFid,
      depositAmount: game.depositAmount,
      hasDeposited: false
    });

    return NextResponse.json({ 
      success: true, 
      game,
      message: `Joined ${game.name}! Deposit ${game.depositAmount} to start playing.`
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join game' },
      { status: 500 }
    );
  }
}