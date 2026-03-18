import { NextRequest, NextResponse } from 'next/server';
import { PolkadotAgentClient } from '@/lib/polkadot-agent/client';
import type { SubstrateExtrinsic } from '@/lib/polkadot-agent/types';

function detectNetwork(endpoint: string): 'polkadot' | 'kusama' | 'westend' | 'local' {
  if (endpoint.includes('westend')) return 'westend';
  if (endpoint.includes('kusama')) return 'kusama';
  if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) return 'local';
  return 'polkadot';
}

export async function POST(req: NextRequest) {
  const wsEndpoint = process.env.SUBSTRATE_WS_ENDPOINT ?? 'wss://rpc.polkadot.io';

  const client = new PolkadotAgentClient({
    wsEndpoint,
    network: detectNetwork(wsEndpoint),
    ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  });

  try {
    const { extrinsics, parallel } = await req.json();

    if (!Array.isArray(extrinsics) || extrinsics.length === 0) {
      return NextResponse.json({ error: 'extrinsics array is required' }, { status: 400 });
    }

    await client.connect();
    const result = await client.dryRunBatch(
      extrinsics as SubstrateExtrinsic[],
      parallel ?? false,
    );
    await client.disconnect();

    return NextResponse.json(result);
  } catch (error) {
    try { await client.disconnect(); } catch {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Simulation failed' },
      { status: 500 },
    );
  }
}
