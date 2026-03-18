import type { SubstrateExtrinsic, BatchSimulationResult, SimulationResult } from './types';

export class SubstrateSimulationBuilder {
  private extrinsics: SubstrateExtrinsic[] = [];
  private parallel = false;

  addExtrinsic(extrinsic: SubstrateExtrinsic): this {
    this.extrinsics.push(extrinsic);
    return this;
  }

  setParallel(parallel: boolean): this {
    this.parallel = parallel;
    return this;
  }

  async run(
    simulator: (ext: SubstrateExtrinsic) => Promise<SimulationResult>,
  ): Promise<BatchSimulationResult> {
    const start = performance.now();

    const results = this.parallel
      ? await Promise.all(this.extrinsics.map(simulator))
      : await this.extrinsics.reduce<Promise<SimulationResult[]>>(
          async (acc, ext) => [...(await acc), await simulator(ext)],
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
    const parallelEfficiency = this.parallel && sequentialTime > 0 ? sequentialTime / duration : 1;

    return { results, totalWeight, parallelEfficiency, conflicts: [], duration };
  }

  reset(): this {
    this.extrinsics = [];
    this.parallel = false;
    return this;
  }

  get count(): number {
    return this.extrinsics.length;
  }
}
