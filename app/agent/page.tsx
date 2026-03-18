'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance, useApi, useChain } from '@luno-kit/react';
import { useSendTransaction } from '@luno-kit/react';
import { Header } from '@/components/layout/header';
import { ChatPanel } from '@/components/agent/chat-panel';
import { AnalysisResults } from '@/components/agent/analysis-results';
import { CodeInput } from '@/components/agent/code-input';
import { ActionProposal } from '@/components/agent/action-proposal';
import type { ChatMessage, AIAnalysisResult } from '@/lib/polkadot-agent/types';
import { parseActionsFromAI, type OnchainAction } from '@/lib/polkadot-agent/actions';

type Tab = 'chat' | 'analyze' | 'optimize';

export default function AgentPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address ?? '' });
  const { api, isApiReady } = useApi();
  const { chain } = useChain();
  const { sendTransactionAsync } = useSendTransaction();

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<OnchainAction[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    const networkName = chain?.name ?? 'unknown';
    const contextPrefix = address
      ? `[User wallet: ${address} | Balance: ${balance?.formattedTransferable ?? 'unknown'} | Network: ${networkName}]\n`
      : `[Network: ${networkName}]\n`;

    const userMsg: ChatMessage = { role: 'user', content, timestamp: Date.now() };
    const messagesWithContext: ChatMessage[] = [
      ...messages,
      { ...userMsg, content: contextPrefix + content },
    ];

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesWithContext }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      const responseText = data.response;

      // Parse any proposed actions from the AI response
      const proposedActions = parseActionsFromAI(responseText);
      if (proposedActions.length > 0) {
        setActions((prev) => [...prev, ...proposedActions]);
      }

      // Clean the response text for display (remove JSON blocks)
      const displayText = responseText.replace(/```json[\s\S]*?```/g, '').trim();

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: displayText || 'Action proposed below.', timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [messages, address, balance, chain]);

  const handleApproveAction = useCallback(async (action: OnchainAction) => {
    if (!api || !isApiReady || !address) return;

    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, status: 'signing' as const } : a))
    );

    try {
      // Build the extrinsic from the action
      const pallet = (api.tx as any)[action.pallet];
      if (!pallet) throw new Error(`Unknown pallet: ${action.pallet}`);

      const method = pallet[action.method];
      if (!method) throw new Error(`Unknown method: ${action.pallet}.${action.method}`);

      // Convert args object to ordered array based on the method
      const argValues = Object.values(action.args);
      const extrinsic = method(...argValues);

      setActions((prev) =>
        prev.map((a) => (a.id === action.id ? { ...a, status: 'broadcasting' as const } : a))
      );

      const receipt = await sendTransactionAsync({ extrinsic });

      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: receipt.status === 'success' ? 'confirmed' as const : 'failed' as const,
                txHash: receipt.transactionHash,
                error: receipt.errorMessage,
              }
            : a
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: receipt.status === 'success'
            ? `Transaction confirmed. Hash: ${receipt.transactionHash}`
            : `Transaction failed: ${receipt.errorMessage}`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id ? { ...a, status: 'failed' as const, error: errorMsg } : a
        )
      );
    }
  }, [api, isApiReady, address, sendTransactionAsync]);

  const handleRejectAction = useCallback((action: OnchainAction) => {
    setActions((prev) => prev.filter((a) => a.id !== action.id));
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `Action "${action.title}" rejected.`, timestamp: Date.now() },
    ]);
  }, []);

  const handleAnalyze = useCallback(async (code: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'chat', label: 'Chat' },
    { key: 'analyze', label: 'Analyze Contract' },
    { key: 'optimize', label: 'Optimize Extrinsic' },
  ];

  const pendingActions = actions.filter((a) => a.status === 'proposed');
  const activeActions = actions.filter((a) => a.status !== 'proposed');

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1700px] mx-auto px-6 py-12"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4">
              PokaClaw
            </p>
            <h1 className="text-[56px] font-bold uppercase leading-[64px]">
              PokaClaw Agent
            </h1>
          </div>
          {address && (
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                Connected Wallet
              </p>
              <p className="text-sm font-mono text-[var(--text)] mt-1">
                {address.slice(0, 8)}...{address.slice(-6)}
              </p>
              {balance && (
                <p className="text-[var(--yo-yellow)] font-bold mt-1">
                  {balance.formattedTransferable}
                </p>
              )}
            </div>
          )}
        </div>

        {!address && (
          <div className="bg-[var(--surface-1)] rounded-[30px] p-10 text-center mb-6">
            <p className="text-[var(--yo-yellow)] text-[28px] font-bold uppercase mb-3">
              Connect Your Wallet
            </p>
            <p className="text-[var(--muted)]">
              Connect a wallet to use the agent for onchain actions.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase transition-colors ${
                activeTab === tab.key
                  ? 'bg-[var(--yo-yellow)] text-black'
                  : 'bg-[var(--surface-2)] text-[var(--text)] hover:opacity-80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {analysisError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[16px] p-5 text-red-400 mb-6">
            {analysisError}
          </div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ChatPanel
              messages={messages}
              onSend={handleSendMessage}
              isLoading={isChatLoading}
            />
            <div className="space-y-6">
              {pendingActions.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--yo-yellow)] mb-4">
                    Pending Actions
                  </p>
                  <div className="space-y-3">
                    {pendingActions.map((action) => (
                      <ActionProposal
                        key={action.id}
                        action={action}
                        onApprove={handleApproveAction}
                        onReject={handleRejectAction}
                      />
                    ))}
                  </div>
                </div>
              )}
              {activeActions.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4">
                    Action History
                  </p>
                  <div className="space-y-3">
                    {activeActions.map((action) => (
                      <ActionProposal
                        key={action.id}
                        action={action}
                        onApprove={handleApproveAction}
                        onReject={handleRejectAction}
                      />
                    ))}
                  </div>
                </div>
              )}
              {actions.length === 0 && (
                <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
                  <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-4">
                    Actions
                  </h3>
                  <p className="text-[var(--muted)]">
                    Tell the agent what to do. Transfer DOT, stake, nominate validators. Actions will appear here for your approval before signing.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {(activeTab === 'analyze' || activeTab === 'optimize') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
              <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
                {activeTab === 'analyze' ? 'Contract Code' : 'Extrinsic Code'}
              </h3>
              <CodeInput onSubmit={handleAnalyze} isLoading={isAnalyzing} />
            </div>
            <AnalysisResults result={analysisResult} isLoading={isAnalyzing} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
