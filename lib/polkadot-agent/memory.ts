import Supermemory from 'supermemory';

let client: Supermemory | null = null;

function getClient(): Supermemory | null {
  if (!process.env.SUPERMEMORY_API_KEY) return null;
  if (!client) {
    client = new Supermemory({ apiKey: process.env.SUPERMEMORY_API_KEY });
  }
  return client;
}

function userTag(walletAddress?: string): string {
  return walletAddress ? `wallet-${walletAddress.slice(0, 16)}` : 'anonymous';
}

export async function addMemory(
  content: string,
  walletAddress?: string,
): Promise<void> {
  const sm = getClient();
  if (!sm) return;

  await sm.add({
    content,
    containerTag: userTag(walletAddress),
  });
}

export async function recallMemories(
  query: string,
  walletAddress?: string,
): Promise<string[]> {
  const sm = getClient();
  if (!sm) return [];

  try {
    const results = await sm.search.memories({
      q: query,
      containerTag: userTag(walletAddress),
      limit: 5,
    });

    return (results.results ?? []).map(
      (r) => r.memory ?? '',
    ).filter(Boolean);
  } catch {
    return [];
  }
}

export async function forgetMemory(
  content: string,
  walletAddress?: string,
): Promise<void> {
  const sm = getClient();
  if (!sm) return;

  await sm.memories.forget({
    content,
    containerTag: userTag(walletAddress),
  });
}
