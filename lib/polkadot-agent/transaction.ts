import type { SubstrateExtrinsic } from './types';

export class ExtrinsicBuilder {
  private extrinsic: Partial<SubstrateExtrinsic> = {};

  from(): this {
    return this;
  }

  pallet(name: string): this {
    this.extrinsic.pallet = name;
    return this;
  }

  method(name: string): this {
    this.extrinsic.method = name;
    return this;
  }

  args(...args: unknown[]): this {
    this.extrinsic.args = args;
    return this;
  }

  tip(amount: string): this {
    this.extrinsic.tip = amount;
    return this;
  }

  build(): SubstrateExtrinsic {
    if (!this.extrinsic.pallet) throw new Error('Pallet is required');
    if (!this.extrinsic.method) throw new Error('Method is required');
    return {
      pallet: this.extrinsic.pallet,
      method: this.extrinsic.method,
      args: this.extrinsic.args ?? [],
      tip: this.extrinsic.tip,
    };
  }

  static createTransfer(dest: string, amount: string): SubstrateExtrinsic {
    return new ExtrinsicBuilder()
      .pallet('balances')
      .method('transferKeepAlive')
      .args(dest, amount)
      .build();
  }

  static createStake(amount: string): SubstrateExtrinsic {
    return new ExtrinsicBuilder()
      .pallet('staking')
      .method('bond')
      .args(amount, 'Staked')
      .build();
  }

  static createNominate(validators: string[]): SubstrateExtrinsic {
    return new ExtrinsicBuilder()
      .pallet('staking')
      .method('nominate')
      .args(validators)
      .build();
  }
}
