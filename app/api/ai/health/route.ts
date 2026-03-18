import { NextResponse } from 'next/server';
import { getAIService } from '@/lib/polkadot-agent/get-ai-service';

export async function GET() {
  const provider = process.env.AI_PROVIDER ?? (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'ollama');
  const service = getAIService();
  const available = await service.isAvailable();
  return NextResponse.json({ available, provider });
}
