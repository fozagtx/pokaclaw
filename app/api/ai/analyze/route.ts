import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/polkadot-agent/get-ai-service';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const service = getAIService();

    const available = await service.isAvailable();
    if (!available) {
      return NextResponse.json({ error: 'AI provider is not available. Check your configuration.' }, { status: 503 });
    }

    const result = await service.analyzeContract(code);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 },
    );
  }
}
