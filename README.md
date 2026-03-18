<p align="center">
  <img src="public/ascii-art-text.png" alt="PokaClaw" />
</p>

Private AI agent for trusted onchain actions on Polkadot. Connect your wallet, tell it what to do in natural language, review the proposed action, approve and sign. AI runs locally or through OpenRouter.

## Architecture

```mermaid
graph TD
    User([User]) --> UI[Next.js Frontend]
    UI --> WC[Wallet Connectors]
    UI --> Agent[AI Chat Agent]
    UI --> Analyzer[Contract Analyzer]
    UI --> Dashboard[Simulation Dashboard]

    WC --> PJS[Polkadot.js]
    WC --> SW[SubWallet]
    WC --> TAL[Talisman]
    WC --> PG[PolkaGate]
    WC --> WCO[WalletConnect]
    WC --> NV[Nova]

    Agent --> AIRouter{AI Provider}
    Analyzer --> AIRouter
    AIRouter -->|local| Ollama[Ollama]
    AIRouter -->|cloud| OR[OpenRouter]

    Agent --> Actions[Action Parser]
    Actions -->|proposed| Approval{User Approval}
    Approval -->|approved| Signer[Wallet Signer]
    Signer --> Chain[(Substrate Chain)]

    Dashboard --> SimAPI[Simulation API]
    SimAPI --> Chain
```

## Agent Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat Panel
    participant AI as AI Service
    participant P as Action Parser
    participant W as Wallet

    U->>C: "Send 5 DOT to Alice"
    C->>AI: message + wallet context
    AI->>C: response with JSON action block
    C->>P: parse action from response
    P->>C: OnchainAction (status: proposed)
    C->>U: display action card for review
    U->>C: approve
    C->>W: build extrinsic & sign
    W->>U: confirm in wallet extension
    U->>W: sign
    W->>C: tx hash
    C->>U: "Transaction confirmed"
```

## Simulation Dashboard

Dry-run any extrinsic against the live chain without submitting. Define pallet, method, and args — the simulator estimates weight and reports success/failure. Supports batching multiple extrinsics in sequential or parallel mode.

```mermaid
graph LR
    User[User Input] -->|"pallet / method / args"| Form[Extrinsic Builder]
    Form -->|"1..N extrinsics"| API[/api/chain/simulate]
    API --> Client[PolkadotAgentClient.dryRun]
    Client -->|parallel=false| Seq[Sequential]
    Client -->|parallel=true| Par[Promise.all]
    Seq --> Weight[Weight Estimation]
    Par --> Weight
    Weight --> QI[transactionPaymentApi.queryInfo]
    QI -->|"runtime trap / fallback"| PI[tx.paymentInfo]
    Weight --> Results[BatchSimulationResult]
    Results --> Metrics[Success Rate / Avg Weight / Duration]
```

## Contract Analysis

```mermaid
graph TD
    Code[ink! / Pallet Code] --> VS[Vulnerability Scan]
    Code --> WO[Weight Optimization]

    VS --> VR[Vulnerabilities]
    VS --> RS[Risk Score]
    WO --> OPT[Optimizations]
    WO --> WA[Weight Analysis]

    VR --> Report[Analysis Report]
    RS --> Report
    OPT --> Report
    WA --> Report

    subgraph Scan Targets
        RE[Reentrancy]
        OF[Overflow/Underflow]
        AC[Missing Origin Checks]
        SE[Storage Exhaustion]
        WM[Weight Manipulation]
        CC[Cross-Contract Calls]
    end

    VS --> RE
    VS --> OF
    VS --> AC
    VS --> SE
    VS --> WM
    VS --> CC
```

## Supported Actions

```mermaid
graph LR
    subgraph balances
        T[transferKeepAlive]
        TA[transferAll]
    end

    subgraph staking
        B[bond]
        N[nominate]
        CH[chill]
        UB[unbond]
    end

    subgraph convictionVoting
        V[vote]
    end

    subgraph custom
        ANY[any pallet.method]
    end
```

## Networks

| Network  | Token | Endpoint                          | Planck/Token       |
|----------|-------|-----------------------------------|--------------------|
| Polkadot | DOT   | `wss://rpc.polkadot.io`          | 10,000,000,000     |
| Kusama   | KSM   | `wss://kusama-rpc.polkadot.io`   | 1,000,000,000,000  |
| Westend  | WND   | `wss://westend-rpc.polkadot.io`  | 1,000,000,000,000  |

## Project Structure

```
app/
  page.tsx                    # landing page
  agent/page.tsx              # AI chat + action approval
  dashboard/page.tsx          # simulation dashboard
  providers.tsx               # LunoKit wallet config
  api/
    ai/chat/route.ts          # chat endpoint
    ai/analyze/route.ts       # contract analysis endpoint
    ai/health/route.ts        # health check
    chain/info/route.ts       # chain info endpoint
    chain/simulate/route.ts   # extrinsic simulation endpoint
lib/polkadot-agent/
  client.ts                   # PolkadotAgentClient (connect, query, simulate)
  ai-service.ts               # Ollama + OpenRouter providers
  get-ai-service.ts           # AI provider factory
  actions.ts                  # action parsing from AI responses
  prompts.ts                  # system prompts for security audit, optimization, chat
  simulation.ts               # SubstrateSimulationBuilder
  transaction.ts              # ExtrinsicBuilder
  types.ts                    # TypeScript types
```

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env`:

```env
# Required for WalletConnect/Nova connectors (get from cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id

# RPC endpoint
SUBSTRATE_WS_ENDPOINT=wss://westend-rpc.polkadot.io

# AI provider: "ollama" or "openrouter"
AI_PROVIDER=ollama

# Ollama (local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:14b

# OpenRouter (cloud)
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=anthropic/claude-sonnet-4
```

```bash
pnpm dev
```

## Stack

- Next.js 15 (App Router)
- @polkadot/api
- @luno-kit/react + @luno-kit/ui (wallet connectivity)
- Ollama or OpenRouter (AI)
- Tailwind CSS 4
- Framer Motion
