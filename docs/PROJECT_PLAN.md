# Wealth Gainer — Project Plan

> This is the starting point. Define what we're building before writing code.

## 1. Problem Statement

A personal local service for stock market investing. The single user (me) needs AI-powered
analysis to make better buy/sell decisions. Manually tracking stocks, news, and global events
is time-consuming and error-prone — the service should automate this and surface actionable
recommendations.

**User:** Solo (local only, no auth, no multi-tenancy)
**Broker:** Interactive Brokers (IBKR) — all markets available there for Ukrainian residents

## 2. Goals & Success Criteria

- [ ] AI analyzes stocks and provides buy/sell recommendations
- [ ] Monitor news and world events that affect the market
- [ ] Dashboard to visualize everything in one place
- [ ] Build the best possible decision-making algorithm (iterative, research-heavy)

## 3. Scope

### Core Features

1. **Stock Analysis Engine** — All types: technical, fundamental, and sentiment analysis
2. **News & Events Monitoring** — Aggregate and analyze relevant news, detect market-moving events
3. **Recommendation System** — Buy/sell/hold signals with reasoning
4. **Dashboard** — Visual interface to see recommendations, portfolio state, news, and analytics

### Asset Allocation

- **Primary:** Stocks available via Interactive Brokers (US, EU, and other IBKR-supported exchanges)
- **Minor (5-10%):** Crypto — experimental only, not a priority

### Trading Horizons

All three, analyzed separately:
- **Day trading** — intraday signals
- **Swing trading** — days to weeks
- **Long-term investing** — months to years

### Out of Scope (for now)

- Automated trading / order execution
- Multi-user support
- Mobile app
- Cloud deployment (local only)

## 4. Tech Stack Decisions

| Layer        | Choice | Notes |
|-------------|--------|-------|
| Frontend    | React | Default dashboard layout, design to be refined later |
| Backend     | Python (FastAPI) | Best ecosystem for finance (pandas, ta-lib, yfinance) + great Claude API support |
| Database    | PostgreSQL | Handles time-series stock data well, robust for complex queries |
| AI/LLM      | Claude (Anthropic API) | Powers all analysis agents |
| Stock Data  | yfinance (bulk/historical) + Finnhub (daily updates) | Free tier, covers US + EU markets |
| News Data   | MarketAux (sentiment-tagged) + Finnhub News + RSS feeds | Free tier, sufficient for single user |
| Tech Indicators | pandas-ta (computed locally) | More reliable than API-dependent indicators |
| **Broker API** | **IBKR TWS API via ib_async** | **Paper + Live trading, bracket orders** |
| **Broker Gateway** | **IB Gateway + IBC** | **Local, auto-login, lighter than full TWS** |

## 5. AI Agent Architecture — "Personal Hedge Fund"

9 Claude-based agents structured like a real hedge fund (see RESEARCH_ANALYSIS_AND_AI_AGENTS.md for full details):

**Leadership:**

| Agent | Role | Authority |
|-------|------|-----------|
| CIO | Market regime, overall strategy, sets the tone | All agents follow |
| Risk Manager | Independent risk oversight | Veto power on all trades |

**Execution:**

| Agent | Role | Reports To |
|-------|------|-----------|
| Portfolio Manager | Builds trade proposals, manages positions | CIO |
| Research Director | Orchestrates analysts, combines signals | CIO |
| Performance Analyst | Tracks results, measures accuracy, improves system | CIO |

**Research:**

| Agent | Role | Reports To |
|-------|------|-----------|
| Technical Analyst | Price action, indicators, chart patterns | Research Director |
| Fundamental Analyst | Financial health, valuation, earnings | Research Director |
| Sentiment Analyst | News, events, market mood | Research Director |
| Scout (Screener) | Scans market for new opportunities | Research Director |

## 6. IT Department (see IT_DEPARTMENT.md for full details)

Development team that builds and maintains the system:

| Role | Responsibility |
|------|---------------|
| **Product Owner** | Owns vision, roadmap, priorities. Decides what gets built and why |
| **Spec Writer** | Translates feature requests into detailed technical specs |
| **Tech Lead** | Reviews specs + code, plans work, guards architecture |
| **Principal Back-End Dev** | Python/FastAPI, DB, data pipelines, agent engine |
| **Principal Front-End Dev** | React dashboard, charts, UI components |

**Workflow:** You → Product Owner → Spec Writer → Tech Lead review → BE/FE develop → Tech Lead code review → PO validates → Done

Feature requests go to `docs/backlog/FEATURE-XXX.md`, specs go to `docs/specs/SPEC-XXX.md`.

## 7. Trading Execution Roadmap

| Stage | Mode | What happens | Risk |
|-------|------|-------------|------|
| **1** | **Manual** | System shows recommendations on Dashboard. You trade on IBKR yourself. | None |
| **2** | **Paper** | System auto-trades on IBKR paper account (fake money). You watch and validate. | None |
| **3** | **Live** | System auto-trades on IBKR live account (real money). Full safety layers active. | Real |

Controlled by one env variable: `TRADING_MODE=manual|paper|live`

**Stage 2 → 3 transition:** Only after weeks/months of paper trading prove the system works.

## 8. Milestones

Priority: get AI trading on paper ASAP, then build Dashboard around it.

### Track A: Core Engine (get paper trading running fast)

| # | Milestone | Description | Status |
|---|-----------|-------------|--------|
| A1 | Foundation | Docs, architecture, all decisions agreed | In progress |
| A2 | Algorithm Research | Analysis approaches, agent design, risk rules | Done |
| A3 | Backend + DB | FastAPI setup, PostgreSQL schema, Alembic migrations | Not started |
| A4 | Data Pipeline | Stock data + news ingestion, indicator computation | Not started |
| A5 | AI Agents | Implement all 9 Claude-based hedge fund agents | Not started |
| A6 | Trade Executor | IBKR connection via ib_async, bracket orders, safety layers | Not started |
| A7 | Paper Trading GO | Connect everything, AI team trades on IBKR paper account | Not started |

**After A7:** The AI team is live on paper. No dashboard yet — just logs, DB records,
and IBKR paper account showing trades. You can monitor in IB Gateway or TWS.

### Track B: Dashboard (build while AI trades paper)

| # | Milestone | Description | Status |
|---|-----------|-------------|--------|
| B1 | Dashboard MVP | React app: portfolio view, recommendations, trade history | Not started |
| B2 | Charts & News | Stock charts, news feed, agent reasoning drill-down | Not started |
| B3 | Performance View | Performance Analyst reports, agent accuracy, P&L tracking | Not started |
| B4 | Kill Switch & Controls | Emergency stop, mode switching (manual/paper/live) | Not started |

### Track C: Go Live (when confident)

| # | Milestone | Description | Status |
|---|-----------|-------------|--------|
| C1 | Validation | Run paper trading for weeks/months, tune algorithm | Not started |
| C2 | IBKR Live | Switch to live trading with real money | Not started |

**Tracks A and B can run in parallel.** Once A7 is done, the AI team is already
learning on paper while you build the Dashboard.

## 9. Open Questions

### Answered

- **Markets:** Everything available on Interactive Brokers (US, EU, etc.)
- **Crypto:** Minor allocation (5-10%), experimental
- **Analysis type:** All — technical, fundamental, sentiment
- **Time horizons:** All — day trading, swing, long-term
- **API budget:** Free public APIs (yfinance + Finnhub + MarketAux + RSS)
- **AI:** Claude (Anthropic API)
- **Backend:** Python + FastAPI
- **Frontend:** React (default dashboard, design later)
- **Database:** PostgreSQL
- **Agents:** 9-agent hedge fund + 5-role IT department
- **Broker API:** IBKR TWS API via ib_async
- **Trading modes:** Manual → Paper → Live (3-stage roadmap)

### Still Open

- Dashboard design details — to be discussed later
- Claude API cost estimation (how many agent calls per day)
- Backtesting approach — how to validate the scoring system
- Crypto allocation — same agents or separate pipeline?
- Historical data depth per horizon (suggested: 2 years daily, 3 months intraday)
- IBKR market data subscription costs per exchange
