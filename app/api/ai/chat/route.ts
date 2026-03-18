import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/polkadot-agent/get-ai-service';
import { recallMemories, addMemory } from '@/lib/polkadot-agent/memory';
import type { ChatMessage } from '@/lib/polkadot-agent/types';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { messages, walletAddress } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const service = getAIService();

    const available = await service.isAvailable();
    if (!available) {
      return NextResponse.json({ error: 'AI provider is not available. Check your configuration.' }, { status: 503 });
    }

    // Get the latest user message for memory recall
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === 'user');
    const query = lastUserMsg?.content ?? '';

    // Recall relevant memories
    const memories = await recallMemories(query, walletAddress);

    // Inject memories as context if any exist
    let enrichedMessages = messages as ChatMessage[];
    if (memories.length > 0) {
      const memoryContext: ChatMessage = {
        role: 'system',
        content: `Relevant memories from past interactions:\n${memories.map((m) => `- ${m}`).join('\n')}`,
        timestamp: Date.now(),
      };
      enrichedMessages = [memoryContext, ...messages];
    }

    const response = await service.chat(enrichedMessages);

    // Store the exchange in memory (fire and forget)
    if (query) {
      addMemory(
        `User: ${query}\nAssistant: ${response.slice(0, 500)}`,
        walletAddress,
      ).catch(() => {});
    }

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 },
    );
  }
}
