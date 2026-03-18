import axios, { type AxiosInstance } from 'axios';
import { PROMPTS } from './prompts';
import type { AIAnalysisResult, ChatMessage, Vulnerability, Optimization, WeightAnalysis } from './types';

export interface AIProvider {
  isAvailable(): Promise<boolean>;
  analyzeContract(code: string): Promise<AIAnalysisResult>;
  suggestWeightOptimizations(code: string): Promise<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }>;
  chat(messages: ChatMessage[]): Promise<string>;
}

// --- Ollama (local) ---

export class OllamaAIService implements AIProvider {
  private client: AxiosInstance;
  private model: string;

  constructor(baseUrl: string, model: string = 'qwen2.5-coder:14b') {
    this.client = axios.create({ baseURL: baseUrl, timeout: 300000 });
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await this.client.get('/api/tags');
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async analyzeContract(code: string): Promise<AIAnalysisResult> {
    const vulnResponse = await this.generate(PROMPTS.vulnerabilityScan + code);
    const optResponse = await this.generate(PROMPTS.weightOptimization + code);
    return buildAnalysisResult(vulnResponse, optResponse);
  }

  async suggestWeightOptimizations(code: string): Promise<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }> {
    const response = await this.generate(PROMPTS.weightOptimization + code);
    const data = parseJSON<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }>(response);
    return {
      optimizations: data?.optimizations ?? [],
      weightAnalysis: data?.weightAnalysis ?? { estimatedRefTime: 0, estimatedProofSize: 0, suggestions: [] },
    };
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const ollamaMessages = [
      { role: 'system' as const, content: PROMPTS.systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await this.client.post('/api/chat', {
      model: this.model,
      messages: ollamaMessages,
      stream: false,
    });

    return res.data.message?.content ?? '';
  }

  private async generate(prompt: string): Promise<string> {
    const res = await this.client.post('/api/generate', {
      model: this.model,
      prompt,
      stream: false,
    });
    return res.data.response ?? '';
  }
}

// --- OpenRouter (cloud) ---

export class OpenRouterAIService implements AIProvider {
  private client: AxiosInstance;
  private model: string;

  constructor(apiKey: string, model: string = 'anthropic/claude-sonnet-4') {
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: 120000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pokaclaw.io',
        'X-Title': 'PokaClaw',
      },
    });
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await this.client.get('/models');
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async analyzeContract(code: string): Promise<AIAnalysisResult> {
    const vulnResponse = await this.complete(PROMPTS.vulnerabilityScan + code);
    const optResponse = await this.complete(PROMPTS.weightOptimization + code);
    return buildAnalysisResult(vulnResponse, optResponse);
  }

  async suggestWeightOptimizations(code: string): Promise<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }> {
    const response = await this.complete(PROMPTS.weightOptimization + code);
    const data = parseJSON<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }>(response);
    return {
      optimizations: data?.optimizations ?? [],
      weightAnalysis: data?.weightAnalysis ?? { estimatedRefTime: 0, estimatedProofSize: 0, suggestions: [] },
    };
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const openRouterMessages = [
      { role: 'system' as const, content: PROMPTS.systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await this.client.post('/chat/completions', {
      model: this.model,
      messages: openRouterMessages,
      max_tokens: 4096,
    });

    return res.data.choices?.[0]?.message?.content ?? '';
  }

  private async complete(prompt: string): Promise<string> {
    const res = await this.client.post('/chat/completions', {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    });
    return res.data.choices?.[0]?.message?.content ?? '';
  }
}

// --- Factory ---

export type AIProviderType = 'ollama' | 'openrouter';

export function createAIService(config: {
  provider?: AIProviderType;
  ollamaUrl?: string;
  ollamaModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
}): AIProvider {
  const provider = config.provider ?? (config.openrouterApiKey ? 'openrouter' : 'ollama');

  if (provider === 'openrouter') {
    if (!config.openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is required for OpenRouter provider');
    }
    return new OpenRouterAIService(config.openrouterApiKey, config.openrouterModel);
  }

  return new OllamaAIService(
    config.ollamaUrl ?? 'http://localhost:11434',
    config.ollamaModel ?? 'qwen2.5-coder:14b',
  );
}

// --- Shared helpers ---

function parseJSON<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
  } catch { /* ignore parse errors */ }
  return null;
}

function calculateRiskScore(vulnerabilities: Vulnerability[]): number {
  const weights = { critical: 40, high: 25, medium: 15, low: 5, info: 1 };
  const score = vulnerabilities.reduce((sum, v) => sum + (weights[v.severity] ?? 0), 0);
  return Math.min(100, score);
}

function buildAnalysisResult(vulnResponse: string, optResponse: string): AIAnalysisResult {
  const vulnData = parseJSON<{ vulnerabilities: Vulnerability[]; summary: string }>(vulnResponse);
  const optData = parseJSON<{ optimizations: Optimization[]; weightAnalysis: WeightAnalysis }>(optResponse);

  return {
    summary: vulnData?.summary ?? 'Analysis complete',
    vulnerabilities: vulnData?.vulnerabilities ?? [],
    optimizations: optData?.optimizations ?? [],
    weightAnalysis: optData?.weightAnalysis ?? { estimatedRefTime: 0, estimatedProofSize: 0, suggestions: [] },
    riskScore: calculateRiskScore(vulnData?.vulnerabilities ?? []),
  };
}
