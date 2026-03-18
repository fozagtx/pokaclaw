import { NextResponse } from 'next/server';
import { PolkadotAgentClient } from '@/lib/polkadot-agent/client';

export async function GET() {
  const wsEndpoint = process.env.SUBSTRATE_WS_ENDPOINT ?? 'wss://rpc.polkadot.io';

  const client = new PolkadotAgentClient({
    wsEndpoint,
    network: 'polkadot',
    ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  });

  try {
    await client.connect();
    const info = await client.getChainInfo();
    await client.disconnect();
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 },
    );
  }
}
