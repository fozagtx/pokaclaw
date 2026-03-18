import { ApiPromise, WsProvider } from '@polkadot/api';
import type {
  PolkadotAgentConfig,
  SubstrateExtrinsic,
  SimulationResult,
  BatchSimulationResult,
  ChainInfo,
  AIAnalysisResult,
  ChatMessage,
} from './types';
import { OllamaAIService } from './ai-service';

export class PolkadotAgentClient {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private aiService: OllamaAIService;
  private config: PolkadotAgentConfig;

  constructor(config: PolkadotAgentConfig) {
    this.config = config;
    this.aiService = new OllamaAIService(config.ollamaUrl, config.ollamaModel);
  }

  async connect(): Promise<void> {
    this.provider = new WsProvider(this.config.wsEndpoint);
    this.api = await ApiPromise.create({ provider: this.provider });
    await this.api.isReady;
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.provider = null;
    }
  }

  get isConnected(): boolean {
    return this.api?.isConnected ?? false;
  }

  getApi(): ApiPromise {
    this.ensureConnected();
    return this.api!;
  }

  async getBalance(address: string): Promise<string> {
    this.ensureConnected();
    const { data } = await this.api!.query.system.account(address) as any;
    return data.free.toString();
  }

  async getBlockNumber(): Promise<number> {
    this.ensureConnected();
    const header = await this.api!.rpc.chain.getHeader();
    return header.number.toNumber();
  }

  async getChainInfo(): Promise<ChainInfo> {
    this.ensureConnected();
    const [chain, nodeName, nodeVersion, header, activeEra, totalIssuance] = await Promise.all([
      this.api!.rpc.system.chain(),
      this.api!.rpc.system.name(),
      this.api!.rpc.system.version(),
      this.api!.rpc.chain.getHeader(),
      this.api!.query.staking?.activeEra?.() ?? Promise.resolve(null),
      this.api!.query.balances?.totalIssuance?.() ?? Promise.resolve(null),
    ]);

    const era = activeEra ? (activeEra as any).unwrapOr(null)?.index?.toNumber?.() ?? 0 : 0;

    return {
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      blockNumber: header.number.toNumber(),
      era,
      totalIssuance: totalIssuance?.toString() ?? '0',
      connected: true,
    };
  }

  async dryRun(extrinsic: SubstrateExtrinsic): Promise<SimulationResult> {
    this.ensureConnected();
    const start = performance.now();

    try {
      const tx = this.api!.tx[extrinsic.pallet][extrinsic.method](...extrinsic.args);

      // Use system.dryRun for simulation when available, fall back to call info
      let refTime = 0;
      let proofSize = 0;

      try {
        // Try the newer rpc call for weight info
        const callInfo = await this.api!.call.transactionPaymentApi.queryInfo(tx.toHex(), 0);
        const weight = (callInfo as any).weight;
        refTime = typeof weight.refTime?.toNumber === 'function'
          ? weight.refTime.toNumber()
          : typeof weight.refTime === 'bigint' ? Number(weight.refTime)
          : Number(weight.refTime ?? 0);
        proofSize = typeof weight.proofSize?.toNumber === 'function'
          ? weight.proofSize.toNumber()
          : typeof weight.proofSize === 'bigint' ? Number(weight.proofSize)
          : Number(weight.proofSize ?? 0);
      } catch {
        // Fall back to queryCallInfo via state call
        const info = await this.api!.rpc.state.call(
          'TransactionPaymentApi_query_info',
          tx.toHex()
        );
        // Parse raw response - weight is embedded in the response
        const hexData = info.toHex();
        // Extract weight from the raw encoded data
        refTime = parseInt(hexData.slice(2, 18), 16) || 0;
        proofSize = parseInt(hexData.slice(18, 34), 16) || 0;
      }

      return {
        success: true,
        weight: { refTime, proofSize },
        executionTimeMs: performance.now() - start,
        storageChanges: [],
        events: [],
      };
    } catch (error) {
      return {
        success: false,
        weight: { refTime: 0, proofSize: 0 },
        executionTimeMs: performance.now() - start,
        storageChanges: [],
        events: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async dryRunBatch(extrinsics: SubstrateExtrinsic[], parallel = false): Promise<BatchSimulationResult> {
    const start = performance.now();
    const results = parallel
      ? await Promise.all(extrinsics.map((ext) => this.dryRun(ext)))
      : await extrinsics.reduce<Promise<SimulationResult[]>>(
          async (acc, ext) => [...(await acc), await this.dryRun(ext)],
          Promise.resolve([]),
        );

    const totalWeight = results.reduce(
      (sum, r) => ({
        refTime: sum.refTime + r.weight.refTime,
        proofSize: sum.proofSize + r.weight.proofSize,
      }),
      { refTime: 0, proofSize: 0 },
    );

    const duration = performance.now() - start;
    const sequentialTime = results.reduce((sum, r) => sum + r.executionTimeMs, 0);
    const parallelEfficiency = parallel && sequentialTime > 0 ? sequentialTime / duration : 1;

    return { results, totalWeight, parallelEfficiency, conflicts: [], duration };
  }

  async estimateWeight(extrinsic: SubstrateExtrinsic): Promise<{ refTime: number; proofSize: number }> {
    const result = await this.dryRun(extrinsic);
    return result.weight;
  }

  async analyzeExtrinsic(code: string): Promise<AIAnalysisResult> {
    return this.aiService.analyzeContract(code);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.aiService.chat(messages);
  }

  private ensureConnected(): void {
    if (!this.api) throw new Error('Not connected to chain. Call connect() first.');
  }
}
