# Wealth Gainer — Architecture

> Living document. Updated as the system evolves.
> Philosophy: This is a **personal hedge fund** powered by AI agents.

## 1. Overview

**Service name:** Wealth Gainer
**Purpose:** Personal AI-powered hedge fund — stock analysis, recommendations, and automated trading
**User:** Single user (fund manager = you), local deployment only
**Broker:** Interactive Brokers (TWS API)

## 2. High-Level Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      React Dashboard                          │
│  Portfolio | Recommendations | News | Charts | Agent Logs    │
│  Trade History | Performance | Kill Switch                   │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP/REST + WebSocket
┌──────────────────────────▼───────────────────────────────────┐
│                      FastAPI Backend                          │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐ │
│  │Data Ingest │ │Agent Engine│ │ Trade    │ │  REST API  │ │
│  │Service     │ │(Hedge Fund)│ │ Executor │ │ (Dashboard)│ │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ └────────────┘ │
│        │              │              │                        │
│  ┌─────▼──────────────▼──────────────▼───────────────────┐   │
│  │           AI Agent Hierarchy (9 Agents)                │   │
│  │                                                        │   │
│  │                    ┌─────────┐                         │   │
│  │                    │   CIO   │ ← Sets strategy         │   │
│  │                    └────┬────┘                         │   │
│  │        ┌────────────────┼────────────────┐            │   │
│  │   ┌────▼────┐  ┌───────▼──┐  ┌──────────▼─┐         │   │
│  │   │ Portf.  │  │   Risk   │  │  Research   │         │   │
│  │   │ Manager │  │   Mgr    │  │  Director   │         │   │
│  │   └────┬────┘  └──(veto)──┘  └────┬───────┘         │   │
│  │        │                     ┌─────┼──────┐          │   │
│  │   ┌────▼────┐          ┌────▼──┐ ┌▼────┐ ┌▼─────┐   │   │
│  │   │  Scout  │          │ Tech. │ │Fund.│ │Sent. │   │   │
│  │   └─────────┘          │Analyst│ │Anl. │ │Anl.  │   │   │
│  │                        └───────┘ └─────┘ └──────┘   │   │
│  │   ┌─────────────────────┐                            │   │
│  │   │ Performance Analyst │ ← Feedback loop            │   │
│  │   └─────────────────────┘                            │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────┬─────────────────────────┬───────────────────────┘
             │                         │
┌────────────▼───────────┐ ┌───────────▼───────────────────────┐
│      PostgreSQL        │ │     Interactive Brokers            │
│                        │ │                                    │
│ stocks | prices        │ │  IB Gateway (local)               │
│ indicators | funds     │ │  ┌──────────────────────────┐     │
│ news | recommendations │ │  │ Paper: port 4002         │     │
│ portfolio | agent_logs │ │  │ Live:  port 4001         │     │
│ orders | trade_outcomes│ │  └──────────────────────────┘     │
│ performance_reports    │ │  via ib_async (Python)            │
│ market_regime          │ │  Orders | Positions | Account     │
└────────────────────────┘ └───────────────────────────────────┘
             │
┌────────────▼───────────────────────────────────────────────┐
│                   External Data Sources                      │
│  yfinance | Finnhub API | MarketAux | RSS Feeds            │
└────────────────────────────────────────────────────────────┘
```

## 3. Core Components

| Component | Responsibility | Tech |
|-----------|---------------|------|
| Dashboard | Visualize portfolio, recommendations, news, charts, agent logs, kill switch | React |
| REST API | Serve data to frontend, trigger analysis | FastAPI |
| Data Ingest Service | Fetch and store stock data, news, fundamentals | Python (scheduled) |
| Agent Engine | Orchestrate 9 hedge fund agents | Python + Anthropic SDK |
| **Trade Executor** | **Place/modify/cancel orders on IBKR** | **Python + ib_async** |
| CIO Agent | Market regime detection, overall strategy | Claude API |
| Risk Manager Agent | Independent risk oversight, veto power | Claude API |
| Research Director Agent | Orchestrate analysts, combine signals | Claude API |
| Portfolio Manager Agent | Build trade proposals, manage positions | Claude API |
| Performance Analyst Agent | Track results, measure accuracy, improve system | Claude API |
| Technical Analyst Agent | Price action and indicator interpretation | Claude API |
| Fundamental Analyst Agent | Financial health and valuation analysis | Claude API |
| Sentiment Analyst Agent | News and event sentiment analysis | Claude API |
| Scout Agent | Market scanning, opportunity discovery | Claude API |
| Indicator Calculator | Compute technical indicators from raw data | pandas-ta |
| Database | Store all persistent data | PostgreSQL |

## 4. Data Flow

### 4.1 Data Ingestion (Scheduled)

```
1. Cron / scheduler triggers data fetch
2. yfinance → historical prices + fundamental data → PostgreSQL
3. Finnhub  → daily quotes, earnings calendar, company news → PostgreSQL
4. MarketAux → sentiment-tagged news → PostgreSQL
5. RSS feeds → broad market news → PostgreSQL
6. pandas-ta computes technical indicators from price data → PostgreSQL
```

### 4.2 Morning Routine (Daily, Before Market Open)

```
1. Data ingestion completes (fresh data in DB)
2. CIO Agent analyzes market conditions → sets regime + stance → DB
3. Risk Manager runs portfolio risk scan → risk report → DB
4. Scout scans market using CIO's sector biases → top candidates → DB
5. Research Director dispatches candidates to 3 analysts (parallel)
6. Analysts return scores → Research Director combines → sends to PM
7. PM builds trade proposals → submits to Risk Manager
8. Risk Manager approves/rejects/modifies each proposal
9. Final recommendations → DB → Dashboard
10. (Auto mode) Trade Executor places approved orders on IBKR
```

### 4.3 On-Demand Analysis (User Requests Specific Stock)

```
1. User selects a stock + horizon on Dashboard
2. Request → Research Director (checks cached CIO stance)
3. Research Director dispatches to 3 analysts (parallel)
4. Same flow as morning routine steps 6-10
```

### 4.4 Real-Time Alerts

```
1. Sentiment Analyst detects breaking news → alerts Research Director
2. Scout detects unusual volume/price move → alerts Research Director
3. Risk Manager detects stop-loss hit or circuit breaker → alerts Dashboard
4. (Auto mode) Trade Executor monitors order fills and position updates from IBKR
```

### 4.5 Trade Execution Flow

```
                  ┌──────────────┐
                  │   PM builds  │
                  │ trade proposal│
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ Risk Manager │
                  │   review     │
                  └──────┬───────┘
                    ┌────┴────┐
                    │         │
              ┌─────▼──┐ ┌───▼────┐
              │Approved│ │Rejected│ → logged, shown on dashboard
              └─────┬──┘ └────────┘
                    │
         ┌──────────▼──────────┐
         │ Execution Mode?     │
         └──┬──────┬───────┬───┘
            │      │       │
     ┌──────▼┐ ┌───▼───┐ ┌▼──────┐
     │Manual │ │Paper  │ │Live   │
     │       │ │       │ │       │
     │Show on│ │Execute│ │Execute│
     │dash-  │ │on IBKR│ │on IBKR│
     │board  │ │paper  │ │live   │
     │only   │ │(4002) │ │(4001) │
     └───────┘ └───────┘ └───────┘
```

## 5. Trading Execution Roadmap

### Stage 1: Manual Mode (current)

- System produces recommendations on Dashboard
- You read, decide, execute trades yourself on IBKR
- You log trades manually so Performance Analyst can track
- **Risk: Zero.** System cannot touch your money.

### Stage 2: Paper Trading Mode

- System connects to IBKR Paper Account (port 4002)
- AI team fully manages a fake portfolio — places real orders on simulated account
- Real market data, simulated fills
- Performance Analyst tracks everything automatically
- Dashboard shows full trade history with P&L
- **Run for weeks/months until you trust the system**
- **Risk: Zero.** Paper money only.

### Stage 3: Live Mode

- Switch IB Gateway from port 4002 → 4001 (one config change)
- AI team manages real money
- All safety layers active (see Section 8)
- Start with a small portion of capital
- **Risk: Real.** Multiple safety layers protect you.

### Switching between modes

Single environment variable in `.env`:

```
TRADING_MODE=manual   # Stage 1: recommendations only
TRADING_MODE=paper    # Stage 2: auto-trade on paper account
TRADING_MODE=live     # Stage 3: auto-trade with real money
```

## 6. Trade Executor Service

**New component** that connects to IBKR via TWS API.

### Tech Stack

| Component | Choice | Notes |
|-----------|--------|-------|
| Python library | `ib_async` | Best maintained IBKR wrapper (successor to ib_insync) |
| Local gateway | IB Gateway | Lighter than full TWS (~40% less RAM) |
| Auto-login | IBC (IB Controller) | Automates daily login/restart |
| Connection | Socket (TCP) | Paper: port 4002, Live: port 4001 |

### Capabilities

| Feature | Supported |
|---------|-----------|
| Place orders (market, limit, stop) | Yes |
| Bracket orders (entry + stop-loss + take-profit) | Yes — every trade gets a bracket |
| Modify/cancel orders | Yes |
| Read portfolio & positions | Yes |
| Account balance & P&L | Yes (real-time streaming) |
| Real-time quotes | Yes (requires IBKR market data subscription) |

### Order Rules

- **Every order is a bracket order** — entry + stop-loss + take-profit, always
- Orders are logged to DB before submission (audit trail)
- Order status tracked: submitted → filled / rejected / cancelled
- Portfolio state synced from IBKR to DB after every fill

## 7. Data Storage

**Database:** PostgreSQL (local)
**Migrations:** Alembic

### Key Tables (preliminary)

- `stocks` — ticker, name, exchange, sector, market cap
- `prices` — ticker, date, OHLCV, timeframe (daily/intraday)
- `indicators` — ticker, date, indicator_name, value, timeframe
- `fundamentals` — ticker, quarter, all financial metrics
- `news` — id, ticker, headline, source, sentiment_score, published_at
- `recommendations` — ticker, date, horizon, combined_score, signal, reasoning
- `portfolio` — ticker, shares, entry_price, entry_date, horizon, stop_loss
- `orders` — id, recommendation_id, ibkr_order_id, type, status, submitted_at, filled_at
- `agent_logs` — id, ticker, agent_type, input_summary, output, created_at
- `watchlists` — id, ticker, screening_criteria, added_at
- `market_regime` — date, regime, stance, sector_biases, reasoning (CIO output)
- `risk_reports` — date, total_exposure, drawdown, sector_breakdown, warnings
- `trade_outcomes` — recommendation_id, actual_return, hit_target, hit_stop, duration
- `performance_reports` — period, portfolio_return, benchmark_return, agent_accuracy, proposals

## 8. Safety Layers (Defense in Depth)

When running in Paper or Live mode, **5 independent safety layers** protect the portfolio:

```
Layer 1: CIO              — sets overall stance (aggressive/defensive/cash)
                            In "cash" mode, no new trades are placed.

Layer 2: Risk Manager      — veto power on every trade
                            Blocks: oversized positions, concentration risk,
                            correlated trades, trades during circuit breakers.

Layer 3: Trade Executor    — hardcoded limits in code (NOT AI-controlled)
         (our code)          • Max single order size: X% of portfolio
                            • Max daily loss: 3% → stop all trading
                            • Max open orders: N
                            • Max trades per day: N
                            • Bracket orders mandatory (no naked entries)

Layer 4: IBKR              — broker-level precautions
         (their systems)     • Order size warnings (configurable in TWS)
                            • Real-time margin enforcement
                            • Auto-liquidation if margin violated

Layer 5: Kill Switch       — one button on Dashboard
         (you)               • Cancels ALL open orders immediately
                            • Optionally flattens all positions
                            • Switches system to Manual mode
                            • Always accessible, always works
```

**Important:** Layer 3 limits are **hardcoded in Python, not controlled by AI agents.**
No agent can override these limits. They are the last programmatic line of defense.

## 9. External Integrations

| Service | Purpose | Limits / Notes |
|---------|---------|---------------|
| yfinance | Historical prices, fundamentals | Unlimited (unofficial, may break) |
| Finnhub | Daily quotes, earnings, company news | 60 calls/min |
| MarketAux | Sentiment-tagged financial news | 100 req/day |
| RSS Feeds | Broad market news (CNBC, Reuters, etc.) | Unlimited |
| Claude API (Anthropic) | All 9 AI agents | Pay per token |
| **IBKR TWS API** | **Order execution, portfolio, account data** | **50 msg/sec, requires IB Gateway** |

## 10. Security Considerations

- **Local only** — no public exposure, no auth needed
- **API keys** stored in `.env` file (Anthropic, Finnhub, MarketAux)
- **IBKR credentials** managed by IB Gateway + IBC (not stored in our code)
- `.env` excluded from version control via `.gitignore`
- **Trade Executor has hardcoded safety limits** — not AI-controllable
- **Kill switch** accessible from Dashboard at all times
- All orders logged with full audit trail

## 11. Deployment & Infrastructure

- **Local machine** — runs on developer's Mac
- **PostgreSQL** — local instance (Homebrew or Docker)
- **IB Gateway** — local instance + IBC for auto-login
- **No CI/CD** — manual run for now
- **Process management** — Docker Compose (FastAPI + PostgreSQL + IB Gateway)

## 12. Key Constraints & Trade-offs

| Constraint | Impact |
|-----------|--------|
| Free data APIs only | Rate limits, potential data gaps, yfinance reliability risk |
| Local only | No scaling concerns, but must run on a single machine |
| Claude API cost | 9 agents = more API calls; batch wisely, cache CIO/fundamental data |
| IBKR market data | Requires paid subscription for real-time quotes ($1-10/mo per exchange) |
| IB Gateway needs GUI | Cannot run fully headless without IBC + virtual display |
| Paper trading limitations | Some order types not simulated, fill simulation is approximate |
