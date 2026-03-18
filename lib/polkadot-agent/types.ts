export type Network = 'polkadot' | 'kusama' | 'westend' | 'local';

export interface PolkadotAgentConfig {
  wsEndpoint: string;
  network: Network;
  ollamaUrl: string;
  ollamaModel?: string;
}

export interface SubstrateExtrinsic {
  pallet: string;
  method: string;
  args: unknown[];
  tip?: string;
}

export interface SimulationResult {
  success: boolean;
  weight: { refTime: number; proofSize: number };
  executionTimeMs: number;
  storageChanges: StorageChange[];
  events: string[];
  error?: string;
}

export interface BatchSimulationResult {
  results: SimulationResult[];
  totalWeight: { refTime: number; proofSize: number };
  parallelEfficiency: number;
  conflicts: string[];
  duration: number;
}

export interface StorageChange {
  key: string;
  oldValue: string | null;
  newValue: string | null;
  pallet: string;
}

export interface AIAnalysisResult {
  summary: string;
  vulnerabilities: Vulnerability[];
  optimizations: Optimization[];
  weightAnalysis: WeightAnalysis;
  riskScore: number;
}

export interface Vulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location?: string;
  recommendation: string;
}

export interface Optimization {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'weight' | 'storage' | 'logic' | 'security';
}

export interface WeightAnalysis {
  estimatedRefTime: number;
  estimatedProofSize: number;
  benchmarkComparison?: string;
  suggestions: string[];
}

export interface ChainInfo {
  chain: string;
  nodeName: string;
  nodeVersion: string;
  blockNumber: number;
  era: number;
  totalIssuance: string;
  connected: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
