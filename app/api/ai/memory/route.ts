import { NextRequest, NextResponse } from 'next/server';
import { addMemory, recallMemories, forgetMemory } from '@/lib/polkadot-agent/memory';

// Add a memory
export async function POST(req: NextRequest) {
  try {
    const { content, walletAddress } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    await addMemory(content, walletAddress);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add memory' },
      { status: 500 },
    );
  }
}

// Search memories
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    const walletAddress = req.nextUrl.searchParams.get('wallet') ?? undefined;
    if (!q) {
      return NextResponse.json({ error: 'q query param is required' }, { status: 400 });
    }
    const memories = await recallMemories(q, walletAddress);
    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 },
    );
  }
}

// Forget a memory
export async function DELETE(req: NextRequest) {
  try {
    const { content, walletAddress } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    await forgetMemory(content, walletAddress);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to forget memory' },
      { status: 500 },
    );
  }
}
