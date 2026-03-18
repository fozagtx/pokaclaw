export type ActionType = 'transfer' | 'stake' | 'nominate' | 'unnominate' | 'unbond' | 'chill' | 'vote' | 'custom';

export interface OnchainAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  pallet: string;
  method: string;
  args: Record<string, string>;
  estimatedFee?: string;
  status: 'proposed' | 'approved' | 'signing' | 'broadcasting' | 'confirmed' | 'failed';
  txHash?: string;
  error?: string;
}

export function parseActionsFromAI(text: string): OnchainAction[] {
  const actions: OnchainAction[] = [];

  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      const rawActions = Array.isArray(parsed) ? parsed : parsed.actions ? parsed.actions : [parsed];

      for (const raw of rawActions) {
        if (raw.type && raw.pallet && raw.method) {
          actions.push({
            id: crypto.randomUUID(),
            type: raw.type,
            title: raw.title ?? `${raw.pallet}.${raw.method}`,
            description: raw.description ?? '',
            pallet: raw.pallet,
            method: raw.method,
            args: raw.args ?? {},
            status: 'proposed',
          });
        }
      }
    }
  } catch {
    // AI response didn't contain valid action JSON
  }

  return actions;
}

export const ACTION_EXAMPLES = {
  transfer: {
    type: 'transfer',
    title: 'Transfer DOT',
    pallet: 'balances',
    method: 'transferKeepAlive',
    args: { dest: '<address>', value: '<amount_in_planck>' },
  },
  stake: {
    type: 'stake',
    title: 'Bond DOT for Staking',
    pallet: 'staking',
    method: 'bond',
    args: { value: '<amount_in_planck>', payee: 'Staked' },
  },
  nominate: {
    type: 'nominate',
    title: 'Nominate Validators',
    pallet: 'staking',
    method: 'nominate',
    args: { targets: '<comma_separated_addresses>' },
  },
  chill: {
    type: 'chill',
    title: 'Stop Nominating',
    pallet: 'staking',
    method: 'chill',
    args: {},
  },
  unbond: {
    type: 'unbond',
    title: 'Unbond DOT',
    pallet: 'staking',
    method: 'unbond',
    args: { value: '<amount_in_planck>' },
  },
} as const;
