'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { FeatureCard } from '@/components/ui/feature-card';
import { ShieldCheck, Brain, Wallet, Zap } from 'lucide-react';

const FEATURES = [
  {
    category: 'Trust',
    title: 'Your Agent',
    description: 'Your personal onchain agent. Propose actions through natural language transfers, staking, nominations and approve before signing.',
    icon: <ShieldCheck size={32} />,
  },
  {
    category: 'AI',
    title: 'AI Analysis',
    description: 'Detect vulnerabilities in ink! contracts and Substrate pallets using local LLM-powered security auditing. Your code never leaves your machine.',
    icon: <Brain size={32} />,
  },
  {
    category: 'Wallet',
    title: 'Wallet Native',
    description: 'Connected directly to your Polkadot wallet. Real balances, real transactions, real chain data. No mock data, ever.',
    icon: <Wallet size={32} />,
  },
  {
    category: 'Actions',
    title: 'Onchain Actions',
    description: 'Transfer DOT, bond for staking, nominate validators, vote on governance all through conversational AI with your approval.',
    icon: <Zap size={32} />,
  },
];

const STATS = [
  { label: 'Supported Networks', value: '3' },
  { label: 'Pallet Methods', value: '200+' },
  { label: 'AI Models', value: 'Local' },
  { label: 'Latency', value: '<50ms' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-black rounded-b-[120px] z-10 relative pb-[170px] overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px)`,
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--yo-yellow)] opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="max-w-[1700px] mx-auto px-6 pt-32 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[88px] font-bold uppercase leading-[80px] max-w-[900px]">
              Poka
              <br />
              <span className="text-[var(--yo-yellow)]">Claw</span>
            </h1>
            <p className="text-base font-normal leading-6 text-[var(--muted)] mt-8 max-w-[600px]">
              A private AI agent for trusted onchain actions on Polkadot. Connect your wallet,
              tell it what to do, approve and sign. Everything runs locally.
            </p>
            <div className="mt-10">
              <Link
                href="/agent"
                className="bg-[var(--yo-yellow)] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity inline-block"
              >
                Try Agent
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--surface-1)] -mt-[120px] z-20 relative rounded-b-[120px] pb-[170px]">
        <div className="max-w-[1700px] mx-auto px-6 pt-[180px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4">
              Capabilities
            </p>
            <h2 className="text-[56px] font-bold uppercase leading-[64px] mb-12">
              Everything you need
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                category={feature.category}
                title={feature.title}
                description={feature.description}
                colorIndex={i}
                icon={feature.icon}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black -mt-[120px] z-30 relative rounded-b-[120px] pb-[170px]">
        <div className="max-w-[1700px] mx-auto px-6 pt-[180px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[var(--surface-1)] rounded-[20px] p-6 border-t-[3px] border-[var(--yo-yellow)]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                  {stat.label}
                </p>
                <p className="text-[42px] font-bold text-[var(--yo-yellow)]">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="bg-[var(--surface-1)] -mt-[120px] z-40 relative rounded-b-[120px] pb-[170px]">
        <div className="max-w-[1700px] mx-auto px-6 pt-[180px]">
          <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4">
            Get Started
          </p>
          <h2 className="text-[56px] font-bold uppercase leading-[64px] mb-12">
            Quick Start
          </h2>
          <div className="bg-[var(--surface-2)] rounded-[30px] p-10">
            <pre className="text-sm font-mono text-[var(--text)] overflow-x-auto leading-relaxed">
              <code>{`import { PolkadotAgentClient } from '@/lib/polkadot-agent';

const client = new PolkadotAgentClient({
  wsEndpoint: 'wss://rpc.polkadot.io',
  network: 'polkadot',
  ollamaUrl: 'http://localhost:11434',
});

await client.connect();
const info = await client.getChainInfo();
console.log(info.chain, 'block #' + info.blockNumber);

// AI-powered contract analysis
const analysis = await client.analyzeExtrinsic(contractCode);
console.log(analysis.vulnerabilities);`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
