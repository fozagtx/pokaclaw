import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/polkadot-agent/get-ai-service';
import type { ChatMessage } from '@/lib/polkadot-agent/types';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const service = getAIService();

    const available = await service.isAvailable();
    if (!available) {
      return NextResponse.json({ error: 'AI provider is not available. Check your configuration.' }, { status: 503 });
    }

    const response = await service.chat(messages as ChatMessage[]);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 },
    );
  }
}
