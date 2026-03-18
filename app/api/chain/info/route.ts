import { NextResponse } from 'next/server';
import { PolkadotAgentClient } from '@/lib/polkadot-agent/client';

function detectNetwork(endpoint: string): 'polkadot' | 'kusama' | 'westend' | 'local' {
  if (endpoint.includes('westend')) return 'westend';
  if (endpoint.includes('kusama')) return 'kusama';
  if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) return 'local';
  return 'polkadot';
}

export async function GET() {
  const wsEndpoint = process.env.SUBSTRATE_WS_ENDPOINT ?? 'wss://rpc.polkadot.io';

  const client = new PolkadotAgentClient({
    wsEndpoint,
    network: detectNetwork(wsEndpoint),
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
