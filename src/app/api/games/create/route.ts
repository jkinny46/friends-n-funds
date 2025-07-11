// src/app/api/games/create/route.ts

// src/app/api/games/create/route.ts

import { NextResponse } from 'next/server';

// For now, we'll store games in memory
// Later, you can replace this with a real database (Supabase, Postgres, etc.)
const games: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, duration, depositAmount, creatorFid } = body;

    // Create new game
    const game = {
      id: Math.random().toString(36).substring(7), // Simple ID generation
      name,
      duration, // in days
      depositAmount,
      creatorFid,
      players: [{
        fid: creatorFid,
        depositAmount,
        hasDeposited: false // Will be true when they actually deposit
      }],
      status: 'pending', // pending | active | completed
      createdAt: new Date().toISOString(),
      startsAt: null, // Will be set when all players have joined
      endsAt: null, // Will be calculated from startsAt + duration
      totalPot: 0,
      currentYield: 0,
      winner: null
    };

    games.push(game);

    return NextResponse.json({ 
      success: true, 
      game,
      inviteCode: game.id // Players can join with this code
    });

  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

// Get all games (for testing)
export async function GET() {
  return NextResponse.json({ games });
}