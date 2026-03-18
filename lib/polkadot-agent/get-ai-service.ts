import { createAIService, type AIProvider } from './ai-service';

export function getAIService(): AIProvider {
  return createAIService({
    provider: process.env.AI_PROVIDER as any,
    ollamaUrl: process.env.OLLAMA_URL,
    ollamaModel: process.env.OLLAMA_MODEL,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL,
  });
}
