# Wealth Gainer — Analysis Research & AI Agent Architecture

> Research document for Milestone 3 (Algorithm Research). Covers technical, fundamental,
> and sentiment analysis approaches, how to combine them, the multi-agent architecture,
> and risk management rules.

---

## 1. Technical Analysis — Indicators by Horizon

Technical analysis uses price, volume, and derived indicators to identify patterns and
generate trading signals. Different indicators matter at different time scales.

### 1.1 Day Trading (Intraday)

**Primary indicators:**

| Indicator | Purpose | Typical Settings | Signal |
|-----------|---------|-----------------|--------|
| VWAP (Volume-Weighted Avg Price) | Intraday fair value | Session-based | Price above VWAP = bullish bias, below = bearish |
| EMA (9, 21) | Short-term trend | 9-period, 21-period | 9 EMA crossing above 21 EMA = buy signal |
| RSI | Momentum / overbought-oversold | 9 periods (faster than default 14) | Below 30 = oversold, above 70 = overbought |
| MACD | Momentum + trend confirmation | (3, 10, 16) for fast scalping or (12, 26, 9) standard | Signal line crossovers |
| Bollinger Bands | Volatility + mean reversion | 20-period, 2 std dev | Price touching lower band + RSI < 30 = potential buy |
| ATR (Average True Range) | Volatility / stop-loss sizing | 14 periods | Use 1.5-2x ATR for stop placement |

**Volume analysis is critical for day trading.** Confirm all breakouts with above-average
volume. A price move on low volume is unreliable.

**Key patterns:** Opening range breakouts, VWAP reclaims, momentum divergences (price
makes new high but RSI does not).

### 1.2 Swing Trading (Days to Weeks)

**Primary indicators:**

| Indicator | Purpose | Typical Settings | Signal |
|-----------|---------|-----------------|--------|
| RSI | Momentum | 14 periods (standard) | Divergences are especially reliable at this timeframe |
| EMA (20, 50) | Trend identification | 20-day, 50-day | Price crossing above 50 EMA = bullish swing entry |
| MACD | Trend + momentum | (12, 26, 9) standard | Histogram turning positive = strengthening momentum |
| Bollinger Bands | Volatility squeeze + breakout | 20-period, 2 std dev | Squeeze (bands narrowing) followed by expansion = breakout |
| Stochastic Oscillator | Overbought/oversold | (14, 3, 3) | %K crossing above %D below 20 = buy signal |
| Volume (OBV) | Accumulation/distribution | N/A | Rising OBV confirms uptrend; divergence warns of reversal |

**Key patterns:** Flag/pennant continuations, support/resistance bounces, moving average
pullbacks, Bollinger Band squeezes.

### 1.3 Long-Term Investing (Months to Years)

**Primary indicators:**

| Indicator | Purpose | Typical Settings | Signal |
|-----------|---------|-----------------|--------|
| SMA (50, 200) | Major trend | 50-day, 200-day | Golden Cross (50 above 200) = bullish; Death Cross = bearish |
| Weekly MACD | Macro trend shifts | (12, 26, 9) on weekly chart | Weekly MACD cross is a high-reliability macro signal |
| RSI (Monthly) | Long-term overbought/oversold | 14 on monthly chart | Rarely hits extremes; when it does, it is significant |
| Relative Strength (vs index) | Stock vs market comparison | Custom | Outperforming the index = worth holding |
| Moving Average Envelopes | Long-term support/resistance | 200-day +/- 10% | Price at lower envelope = potential value entry |

**For long-term investing, technical analysis plays a supporting role.** It is most useful
for timing entries and exits, not for stock selection itself. Fundamentals drive the "what
to buy" decision; technicals help with "when to buy."

### 1.4 Indicator Combination Rules

Research consistently shows that using 2-3 complementary indicators from different
categories outperforms using many indicators or indicators from the same category:

- **Trend indicator** (EMA/SMA/MACD) + **Momentum indicator** (RSI/Stochastic) +
  **Volume/Volatility indicator** (OBV/ATR/Bollinger Bands)
- Never use two trend indicators together (e.g., two different moving average systems) as
  they provide redundant, correlated signals.
- RSI and Bollinger Bands have proven to be the most consistently reliable indicators
  across backtests.

---

## 2. Fundamental Analysis — Key Metrics

Fundamental analysis evaluates a company's intrinsic value. For an automated system,
focus on quantifiable metrics available via APIs.

### 2.1 Valuation Metrics

| Metric | What It Tells You | Good Signal |
|--------|------------------|-------------|
| P/E Ratio | Price relative to earnings | Compare to sector average; low P/E may indicate undervaluation |
| Forward P/E | Expected future earnings valuation | Lower than trailing P/E = earnings growth expected |
| PEG Ratio | P/E adjusted for growth | PEG < 1.0 suggests undervalued relative to growth |
| P/S Ratio | Price to sales | Useful for unprofitable growth companies |
| P/B Ratio | Price to book value | Below 1.0 may indicate deep value |
| EV/EBITDA | Enterprise value to earnings | Better than P/E for comparing companies with different capital structures |

### 2.2 Profitability Metrics

| Metric | What It Tells You | Good Signal |
|--------|------------------|-------------|
| Gross Margin | Pricing power | Stable or expanding over time |
| Operating Margin | Operational efficiency | Higher than peers |
| Net Margin | Bottom-line profitability | Positive and growing |
| ROE (Return on Equity) | Shareholder return efficiency | > 15% generally strong |
| ROA (Return on Assets) | Asset utilization | Compare within industry |
| ROIC (Return on Invested Capital) | Capital allocation skill | > WACC means value creation |

### 2.3 Growth Metrics

| Metric | What It Tells You | Good Signal |
|--------|------------------|-------------|
| Revenue Growth (YoY, QoQ) | Top-line momentum | Consistent acceleration |
| EPS Growth | Earnings momentum | Sustained positive growth |
| Free Cash Flow Growth | Cash generation trend | Growing FCF is the gold standard |
| R&D as % of Revenue | Innovation investment | Industry-dependent; watch for cuts |

### 2.4 Financial Health Metrics

| Metric | What It Tells You | Good Signal |
|--------|------------------|-------------|
| Debt-to-Equity | Leverage level | Below 1.0 for most industries |
| Current Ratio | Short-term liquidity | Above 1.5 |
| Interest Coverage | Ability to service debt | Above 3x |
| Free Cash Flow Yield | Cash return relative to price | Higher = better value |

### 2.5 Relevance by Horizon

- **Day trading:** Fundamentals are almost irrelevant intraday, except for earnings
  release dates (avoid or specifically trade around them).
- **Swing trading:** Fundamentals provide context. A swing trade aligned with strong
  fundamentals is higher conviction. Check for upcoming earnings dates.
- **Long-term investing:** Fundamentals are the primary driver. Use valuation, growth,
  and health metrics to select stocks. Technical analysis then helps time entries.

---

## 3. Sentiment Analysis — News & Events

### 3.1 Data Sources

| Source | Type | Latency | Use Case |
|--------|------|---------|----------|
| Financial news APIs (Finnhub, NewsAPI) | Headlines + articles | Minutes | Swing & long-term signals |
| SEC filings (EDGAR) | Regulatory filings | Hours-days | Fundamental events (insider trades, 10-K/10-Q) |
| Earnings call transcripts | Company guidance | After market hours | Forward-looking sentiment |
| Social media (Reddit, Twitter/X) | Retail sentiment | Real-time | Contrarian or momentum signals (noisy) |
| Analyst reports / upgrades-downgrades | Professional opinion | Same day | Strong short-term catalysts |
| Economic calendar | Macro events | Scheduled | Fed decisions, CPI, jobs data |

### 3.2 Analysis Techniques

**For an LLM-based system (Claude), the approach is simpler than traditional NLP
pipelines.** Instead of training FinBERT or building VADER-based scoring, Claude can
directly:

1. **Classify sentiment** of news articles as positive / negative / neutral with a
   confidence score (1-100).
2. **Extract key events** — earnings surprises, FDA approvals, lawsuits, insider buying,
   macro policy changes.
3. **Assess materiality** — is this news likely to move the stock price? By how much?
   Timeframe?
4. **Detect contradictions** — when multiple sources disagree, flag uncertainty.

**Weighted Sentiment Score:** When multiple articles exist for one stock on a given day,
aggregate them using a weighted score that accounts for source credibility, recency, and
article relevance.

### 3.3 Relevance by Horizon

- **Day trading:** Breaking news, pre-market catalysts, earnings surprises, analyst
  upgrades/downgrades. Speed matters most. Focus on headline sentiment.
- **Swing trading:** News trends over several days, sector rotation signals, upcoming
  catalysts (earnings dates, FDA dates). Trend of sentiment matters more than any single article.
- **Long-term investing:** Macro trends, industry disruption narratives, regulatory
  environment changes, management quality signals from earnings calls.

### 3.4 Important Caveats

Research shows mixed results on sentiment-only predictions. Sentiment works best as a
**confirming or warning signal** layered on top of technical and fundamental analysis, not
as a standalone predictor. Weekend and pre-market sentiment has modest but measurable
predictive value.

---

## 4. Combined Decision-Making — Weighting by Horizon

### 4.1 Recommended Weights

| Analysis Type | Day Trading | Swing Trading | Long-Term Investing |
|--------------|-------------|---------------|---------------------|
| Technical Analysis | **70%** | **50%** | **20%** |
| Fundamental Analysis | **5%** | **20%** | **50%** |
| Sentiment Analysis | **25%** | **30%** | **30%** |

**Rationale:**
- Day trading is almost entirely price-action driven. Fundamentals are irrelevant
  intraday, but breaking news (sentiment) can dominate.
- Swing trading balances all three. Technical setups provide entries, fundamentals provide
  conviction, sentiment provides catalysts and timing.
- Long-term investing is fundamentals-first. Sentiment helps with macro awareness and
  timing. Technicals help with entry price optimization.

### 4.2 Scoring System

Each analysis type produces a score from -100 (strong sell) to +100 (strong buy):

1. **Technical Score:** Aggregated from individual indicator signals. Each indicator votes
   bullish (+1), neutral (0), or bearish (-1), weighted by reliability. Normalize to
   -100..+100 range.
2. **Fundamental Score:** Based on how the stock's metrics compare to sector peers and
   its own historical averages. Above-average metrics push toward +100; deteriorating
   metrics push toward -100.
3. **Sentiment Score:** Claude-generated score from news analysis. Aggregate multiple
   sources with credibility weighting.

**Combined Score** = (Technical Score x Tech Weight) + (Fundamental Score x Fund Weight)
+ (Sentiment Score x Sent Weight)

### 4.3 Signal Thresholds (suggested starting points, to be tuned)

| Combined Score | Signal |
|---------------|--------|
| +60 to +100 | **Strong Buy** |
| +30 to +59 | **Buy** |
| -29 to +29 | **Hold / Neutral** |
| -59 to -30 | **Sell** |
| -100 to -60 | **Strong Sell** |

### 4.4 Conflict Resolution

When analysis types strongly disagree (e.g., technical = strong buy, fundamental =
strong sell):
- Flag the conflict to the user with full reasoning from each agent.
- Default to the analysis type with the highest weight for that horizon.
- Reduce position size when signals conflict (lower conviction = smaller bet).

---

## 5. AI Agent Architecture — "Personal Hedge Fund"

### 5.1 Overview

The system is structured like a real hedge fund with clear hierarchy, separation of
concerns, and independent risk oversight. 9 Claude-based agents, each with a specialized
role, communicate through a strict chain of command.

**Key hedge fund principles applied:**
- **Risk Manager is independent** — has veto power, Portfolio Manager cannot override
- **CIO sets the tone** — if CIO says "defensive mode", all agents adjust behavior
- **Research and execution are separate** — analysts research, PM executes
- **Every recommendation has a full audit trail** — drill into any agent's reasoning

```
                          ┌──────────────────┐
                          │   Dashboard      │
                          │   (You)          │
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │       CIO        │ ← Sets strategy
                          └──┬───┬───┬───┬───┘
                             │   │   │   │
               ┌─────────────▼┐ ┌▼──┐│ ┌─▼───────────┐
               │  Portfolio   │ │Risk││ │  Research    │
               │  Manager     │ │Mgr ││ │  Director    │
               └──────┬───────┘ │veto││ └──┬────┬────┬─┘
                      │         └────┘│    │    │    │
               ┌──────▼───────┐      │  ┌─▼──┐ ┌▼─┐ ┌▼──────┐
               │    Scout     │      │  │Tech│ │F.│ │Sentim.│
               └──────────────┘      │  │Anl.│ │A.│ │Analyst│
                                     │  └────┘ └──┘ └───────┘
                          ┌──────────▼──────────┐
                          │ Performance Analyst │ ← Feedback loop
                          │ (tracks results,    │
                          │  improves system)   │
                          └─────────────────────┘
```

### 5.2 Agent Definitions

---

#### Agent 1: CIO (Chief Investment Officer)

**Hedge fund equivalent:** The boss. Sets the fund's direction.

**Role:** Detect the current market regime and set the overall investment stance.
All other agents must operate within the boundaries the CIO defines.

**Inputs:**
- Broad market data (S&P 500, VIX, bond yields, sector performance)
- Macro economic indicators (GDP, unemployment, inflation, Fed policy)
- Geopolitical events summary (from Sentiment Analyst)
- Current portfolio state and performance

**Process:**
- Classify market regime: **Bull / Bear / Sideways / Crisis / Recovery**
- Determine overall stance: **Aggressive / Moderate / Defensive / Cash**
- Set allocation guidance per horizon (e.g., "reduce day trading in crisis mode")
- Identify which sectors/regions to favor or avoid right now
- Review portfolio performance and adjust strategy if needed

**Output (JSON):**
```json
{
  "market_regime": "bull | bear | sideways | crisis | recovery",
  "stance": "aggressive | moderate | defensive | cash",
  "horizon_guidance": {
    "day_trading": "active | reduced | paused",
    "swing_trading": "active | reduced | paused",
    "long_term": "accumulate | hold | reduce"
  },
  "sector_bias": {
    "favor": ["tech", "healthcare"],
    "avoid": ["energy", "real_estate"]
  },
  "max_portfolio_risk": "percentage",
  "reasoning": "narrative explanation"
}
```

**Runs:** Daily (morning, before market open) + on-demand when major events occur.

---

#### Agent 2: Risk Manager (Chief Risk Officer)

**Hedge fund equivalent:** Independent risk oversight. Reports to CIO, not to PM.

**Role:** Monitor all risk metrics and enforce hard limits. Has **veto power** over
any trade the Portfolio Manager proposes. Cannot be overridden.

**Inputs:**
- Current portfolio (all positions, sizes, P&L, correlations)
- Proposed trades from Portfolio Manager
- CIO's current stance and risk limits
- Market volatility data (VIX, ATR of holdings)

**Process:**
- Validate every proposed trade against risk rules (Section 6)
- Check position sizing (max 2% risk per trade, max 10% position)
- Check sector concentration (max 30% in one sector)
- Check correlation between new trade and existing holdings
- Monitor portfolio drawdown vs circuit breaker thresholds
- Enforce CIO stance (block aggressive trades in defensive mode)

**Output (JSON):**
```json
{
  "trade_id": "string",
  "verdict": "approved | rejected | approved_with_modifications",
  "modifications": {
    "adjusted_position_size": "number or null",
    "required_stop_loss": "number or null",
    "reason": "string"
  },
  "portfolio_risk_report": {
    "total_exposure": "percentage",
    "sector_breakdown": {},
    "correlation_warnings": [],
    "drawdown_from_peak": "percentage",
    "circuit_breakers_triggered": []
  },
  "reasoning": "narrative"
}
```

**Runs:** On every trade proposal + daily portfolio risk scan.

---

#### Agent 3: Research Director (Head of Research)

**Hedge fund equivalent:** Manages the research team, synthesizes their work.

**Role:** Orchestrate the three analyst agents. Decide what to research, prioritize
requests, and resolve conflicting analyst opinions before passing to Portfolio Manager.

**Inputs:**
- Analysis requests (from user, PM, or Scout)
- CIO's current stance and sector biases
- Outputs from Technical, Fundamental, and Sentiment analysts

**Process:**
- Dispatch analysis requests to the three analysts in parallel
- Collect and validate all three reports
- Apply horizon-specific weights (Section 4.1) to combine scores
- Resolve conflicts when analysts strongly disagree (Section 4.4)
- Add the Research Director's own synthesis: what does the combined picture say?
- Flag high-conviction vs low-conviction opportunities

**Output (JSON):**
```json
{
  "ticker": "string",
  "horizon": "day | swing | long_term",
  "combined_score": "-100 to +100",
  "signal": "strong_buy | buy | hold | sell | strong_sell",
  "conviction": "high | medium | low",
  "analyst_scores": {
    "technical": { "score": "number", "summary": "string" },
    "fundamental": { "score": "number", "summary": "string" },
    "sentiment": { "score": "number", "summary": "string" }
  },
  "conflicts": ["list of disagreements between analysts"],
  "synthesis": "narrative combining all perspectives"
}
```

**Runs:** On-demand per analysis request.

---

#### Agent 4: Technical Analyst

**Hedge fund equivalent:** Quantitative / technical research analyst.

**Role:** Analyze price action and generate technical signals.

**Inputs:**
- Historical OHLCV data (pre-fetched from DB)
- Pre-computed technical indicators (from pandas-ta)
- Timeframe context (day/swing/long-term)
- CIO's current market regime (for context)

**Process:**
- Interpret indicator readings for the given horizon (see Section 1)
- Identify chart patterns, support/resistance levels
- Detect divergences between price and momentum indicators
- Assess trend strength and direction
- Compare to broader market trend (is this stock leading or lagging?)

**Output (JSON):**
```json
{
  "ticker": "string",
  "horizon": "day | swing | long_term",
  "score": "-100 to +100",
  "trend": "strong_up | up | sideways | down | strong_down",
  "indicators": {
    "rsi": { "value": "number", "signal": "bullish | neutral | bearish" },
    "macd": { "value": "number", "signal": "..." },
    "...": "..."
  },
  "key_levels": {
    "support": ["list of prices"],
    "resistance": ["list of prices"],
    "stop_loss_suggestion": "price"
  },
  "patterns": ["list of detected patterns"],
  "reasoning": "narrative"
}
```

**Runs:** On-demand. Day trading = multiple times/day. Swing = daily. Long-term = weekly.

---

#### Agent 5: Fundamental Analyst

**Hedge fund equivalent:** Fundamental research analyst.

**Role:** Evaluate company financial health and intrinsic value.

**Inputs:**
- Financial statements (income, balance sheet, cash flow — from DB)
- Sector/industry peer data for comparison
- Historical fundamental data for trend analysis
- CIO's sector biases (for context)

**Process:**
- Analyze all metrics from Section 2 (valuation, profitability, growth, health)
- Compare to sector averages and historical trends
- Identify improving or deteriorating fundamentals
- Estimate fair value range using multiple methods
- Flag red flags and catalysts (upcoming earnings, insider activity)

**Output (JSON):**
```json
{
  "ticker": "string",
  "score": "-100 to +100",
  "fair_value_estimate": { "low": "price", "mid": "price", "high": "price" },
  "current_premium_discount": "percentage",
  "metrics": {
    "pe_ratio": { "value": "number", "vs_sector": "above | below | inline" },
    "roe": { "value": "number", "trend": "improving | stable | declining" },
    "...": "..."
  },
  "red_flags": ["list"],
  "catalysts": ["list of upcoming events"],
  "reasoning": "narrative"
}
```

**Runs:** On-demand. Updated when new quarterly data arrives.

---

#### Agent 6: Sentiment Analyst

**Hedge fund equivalent:** Macro/sentiment research analyst.

**Role:** Monitor and analyze news, events, and market sentiment.

**Inputs:**
- News articles from MarketAux, Finnhub, RSS (pre-fetched from DB)
- Economic calendar events
- Analyst upgrades/downgrades
- CIO's current geopolitical concerns

**Process:**
- Classify each news item: sentiment, materiality, timeframe of impact
- Aggregate into a weighted sentiment score (source credibility + recency)
- Identify upcoming catalysts (earnings, FDA, macro events)
- Detect sudden sentiment shifts that may precede price moves
- Assess broader market mood and sector sentiment

**Output (JSON):**
```json
{
  "ticker": "string",
  "score": "-100 to +100",
  "news_count": { "positive": "n", "negative": "n", "neutral": "n" },
  "top_stories": [
    { "headline": "string", "sentiment": "number", "materiality": "high | medium | low" }
  ],
  "upcoming_catalysts": [
    { "event": "string", "date": "date", "expected_impact": "string" }
  ],
  "sentiment_trend": "improving | stable | deteriorating",
  "reasoning": "narrative"
}
```

**Runs:** Continuous (news ingestion) + on-demand per analysis request.

---

#### Agent 7: Portfolio Manager (PM)

**Hedge fund equivalent:** Portfolio manager who builds and manages the book.

**Role:** Receive research, build trade proposals, manage positions. Does NOT have
final say — all trades must pass through Risk Manager.

**Inputs:**
- Research Director's combined analysis reports
- CIO's stance and guidance
- Current portfolio state (from DB)
- Risk Manager's portfolio risk report

**Process:**
- Convert research signals into actionable trade proposals
- Calculate position sizes using risk-based sizing (Section 6.1)
- Set entry prices, stop-losses, take-profit targets per horizon
- Manage existing positions: adjust stops, take profits, cut losses
- Submit all proposals to Risk Manager for approval
- Execute approved trades (record in DB; user executes on IBKR manually)

**Output (JSON):**
```json
{
  "action": "open | close | adjust",
  "ticker": "string",
  "direction": "long | short",
  "horizon": "day | swing | long_term",
  "entry_price": "number",
  "stop_loss": "number",
  "take_profit": "number",
  "position_size_shares": "number",
  "position_size_percent": "percentage of portfolio",
  "risk_amount": "dollar amount at risk",
  "research_summary": "string",
  "confidence": "high | medium | low",
  "reasoning": "narrative"
}
```

**Runs:** After each research report + daily portfolio review.

---

#### Agent 8: Scout (Market Screener)

**Hedge fund equivalent:** Junior analyst who scans for ideas.

**Role:** Continuously scan the market for new opportunities and surface them
to the Research Director for full analysis.

**Inputs:**
- Universe of stocks (IBKR-available, filtered by exchange/market cap)
- Screening criteria (configurable)
- Pre-computed technical indicators for the universe
- News/sentiment spikes from Sentiment Analyst
- CIO's sector biases (favor/avoid)

**Process:**
- Run fundamental screens (e.g., P/E < 15, revenue growth > 10%)
- Identify technical setups forming (breakouts, pullbacks, squeezes)
- Flag unusual volume or sentiment spikes
- Filter against CIO's sector guidance
- Rank and prioritize candidates
- Send top candidates to Research Director for full analysis

**Output (JSON):**
```json
{
  "candidates": [
    {
      "ticker": "string",
      "trigger": "technical_setup | fundamental_value | sentiment_spike | volume_anomaly",
      "brief": "one-line rationale",
      "suggested_horizon": "day | swing | long_term",
      "priority": "high | medium | low"
    }
  ]
}
```

**Runs:** Daily scan + real-time alerts for unusual activity.

---

#### Agent 9: Performance Analyst

**Hedge fund equivalent:** Performance attribution / portfolio analytics team.

**Role:** Track every recommendation vs actual outcome. Measure what's working,
what's failing, and why. Feed insights back to CIO and Research Director so the
system learns and improves. Without this agent, the fund is flying blind.

**Inputs:**
- All historical recommendations from `recommendations` table
- Actual price data after each recommendation (what happened?)
- Agent logs (what did each agent say at the time?)
- Portfolio P&L data
- Current agent weights and thresholds

**Process:**
- **Track outcomes:** For every recommendation, record what actually happened
  - Did the stock hit the take-profit target? Stop-loss? Neither?
  - What was the actual return vs predicted direction?
  - How long did it take?
- **Score each agent individually:**
  - Technical Analyst accuracy: % of correct directional calls
  - Fundamental Analyst accuracy: did fair value estimates prove right?
  - Sentiment Analyst accuracy: did news-based signals predict moves?
  - CIO accuracy: was the market regime call correct?
  - Scout quality: % of surfaced candidates that became profitable trades
- **Identify patterns:**
  - Which horizons perform best? (day vs swing vs long-term)
  - Which sectors do we trade well/poorly?
  - Are there market conditions where we consistently fail?
  - Which agent is most/least accurate?
  - Are the current weights (70/5/25, 50/20/30, 20/50/30) optimal?
- **Generate improvement proposals:**
  - Suggest weight adjustments based on actual performance
  - Flag agents that need prompt tuning
  - Recommend threshold changes for signal levels
  - Identify blind spots (things we miss consistently)

**Output (JSON):**
```json
{
  "period": "weekly | monthly | quarterly",
  "portfolio_performance": {
    "total_return": "percentage",
    "benchmark_return": "percentage (S&P 500)",
    "alpha": "percentage (return above benchmark)",
    "sharpe_ratio": "number",
    "max_drawdown": "percentage",
    "win_rate": "percentage",
    "avg_win": "percentage",
    "avg_loss": "percentage",
    "profit_factor": "number (gross profit / gross loss)"
  },
  "performance_by_horizon": {
    "day_trading": { "return": "pct", "win_rate": "pct", "trade_count": "n" },
    "swing": { "return": "pct", "win_rate": "pct", "trade_count": "n" },
    "long_term": { "return": "pct", "win_rate": "pct", "trade_count": "n" }
  },
  "agent_accuracy": {
    "cio": { "regime_accuracy": "pct", "notes": "string" },
    "technical": { "directional_accuracy": "pct", "best_indicator": "string" },
    "fundamental": { "fair_value_accuracy": "pct", "notes": "string" },
    "sentiment": { "signal_accuracy": "pct", "notes": "string" },
    "scout": { "candidate_hit_rate": "pct", "notes": "string" }
  },
  "top_winners": ["list of best trades with details"],
  "top_losers": ["list of worst trades with details"],
  "improvement_proposals": [
    {
      "type": "weight_adjustment | threshold_change | prompt_tuning | strategy_change",
      "description": "string",
      "evidence": "string",
      "priority": "high | medium | low"
    }
  ],
  "reasoning": "narrative summary with key takeaways"
}
```

**Runs:** Weekly summary + monthly deep review + quarterly strategy review.

**Key principle:** This agent closes the feedback loop. Without it, the system
never learns. Every hedge fund measures performance attribution — which bets
worked, which didn't, and why.

---

### 5.3 Agent Communication Flow

```
Morning Routine (Daily):
1. CIO analyzes market conditions → sets regime + stance
2. Risk Manager runs portfolio risk scan → reports exposure
3. Scout scans market → surfaces top candidates
4. Research Director dispatches candidates to analysts
5. Analysts run in parallel → return scores
6. Research Director combines → sends to PM
7. PM builds trade proposals → submits to Risk Manager
8. Risk Manager approves/rejects/modifies → final recommendations
9. Dashboard displays everything with full audit trail

Weekly Review:
1. Performance Analyst reviews all trades from the past week
2. Scores each agent's accuracy
3. Identifies what worked and what failed
4. Sends improvement proposals to CIO and Research Director
5. CIO adjusts strategy if needed based on performance data

On-Demand (User requests analysis of specific stock):
1. Request goes to Research Director
2. Research Director checks CIO stance → dispatches to analysts
3. Same flow as steps 5-9 above

Real-Time Alerts:
1. Sentiment Analyst detects breaking news → alerts Research Director
2. Scout detects unusual volume/price move → alerts Research Director
3. Risk Manager detects stop-loss hit or circuit breaker → alerts PM + Dashboard
```

### 5.4 Agent Hierarchy & Authority

| Agent | Reports To | Authority |
|-------|-----------|-----------|
| CIO | User (You) | Sets strategy, all agents follow |
| Risk Manager | CIO | Veto power on all trades |
| Research Director | CIO | Manages all research, combines signals |
| Portfolio Manager | CIO | Proposes trades, manages positions |
| Performance Analyst | CIO | Reviews results, proposes improvements |
| Technical Analyst | Research Director | Advisory only |
| Fundamental Analyst | Research Director | Advisory only |
| Sentiment Analyst | Research Director | Advisory only |
| Scout | Research Director | Surfaces candidates only |

### 5.5 Implementation Notes

- Each agent is a Claude API call with a specialized system prompt defining its role,
  authority level, available data, and expected JSON output format.
- **CIO, Risk Manager, and Performance Analyst use broader context** — they see the
  whole portfolio and market, not just one stock.
- **Analysts are narrow and deep** — they see detailed data for one stock at a time.
- Data fetching and indicator calculation happens in Python code (not by Claude). Claude
  agents receive pre-computed data and focus on interpretation and judgment.
- Agent outputs are stored in `agent_logs` table for audit trail and performance review.
- Performance Analyst uses `agent_logs` + `recommendations` + actual price data to
  measure each agent's accuracy over time.
- Consider caching: CIO regime assessment is valid for the full day unless a major event
  occurs. Fundamental data changes quarterly. Technical data changes intraday.
- **Cost optimization:** Not every analysis needs all 9 agents. Quick checks can skip
  CIO (use cached stance). Fundamental Analyst skips for day trades. Scout runs on
  a schedule, not per request. Performance Analyst runs weekly, not daily.

---

## 6. Risk Management Rules

These are hard rules the Portfolio Manager Agent must enforce regardless of signal
strength.

### 6.1 Position Sizing

| Rule | Value | Rationale |
|------|-------|-----------|
| Max risk per trade | 2% of total portfolio | Standard retail risk management |
| Max position size | 10% of portfolio | Prevents overconcentration |
| Position size calculation | Risk amount / (entry price - stop loss) | Risk-based sizing |
| Reduced size on low conviction | 50% of normal size when signals conflict | Less conviction = smaller bet |

**Volatility-adjusted sizing:** Use ATR to set stop distances. Higher-volatility stocks
get smaller position sizes because the stop is further away. This normalizes risk across
different stocks.

### 6.2 Stop-Loss Rules

| Horizon | Stop-Loss Method | Typical Distance |
|---------|-----------------|-----------------|
| Day trading | ATR-based or fixed % | 1.5-2x ATR, or 0.5-1% |
| Swing trading | Below support / ATR-based | 2-3x ATR, or 3-5% |
| Long-term | Below major support / trailing | 10-15%, or below 200-day SMA |

- **Trailing stops** for swing and long-term: lock in profits as the position moves
  favorably.
- **Hard stops** are non-negotiable. The system should never recommend holding a position
  past its stop-loss.

### 6.3 Diversification Rules

| Rule | Value |
|------|-------|
| Max positions in one sector | 30% of portfolio |
| Max correlated positions | Flag when correlation > 0.7 between holdings |
| Min number of positions (long-term) | 8-12 for adequate diversification |
| Cash reserve | Always maintain at least 10% cash for opportunities |

### 6.4 Day-Trading-Specific Rules

- No overnight holds for day trades (close all day-trade positions by market close).
- Max daily loss limit: 3% of portfolio. Stop trading for the day if hit.
- Max number of day trades per day: cap to prevent overtrading (suggest 3-5).

### 6.5 Circuit Breakers

- **Portfolio drawdown limit:** If total portfolio drops 10% from peak, reduce all
  position sizes by 50% and flag for review.
- **Correlation spike:** If VIX spikes above 30 or market drops > 3% in a day, pause
  new entries and tighten stops on existing positions.
- **News blackout:** Do not enter new positions within 24 hours of major macro events
  (Fed meetings, CPI releases) unless the strategy specifically targets those events.

---

## 7. Data Requirements Summary

| Data Type | Source Candidates | Update Frequency | Horizon |
|-----------|------------------|-----------------|---------|
| OHLCV (price/volume) | Yahoo Finance, Alpha Vantage, Finnhub | Real-time or 15-min delay | All |
| Financial statements | Alpha Vantage, Financial Modeling Prep, SEC EDGAR | Quarterly | Swing, Long-term |
| Analyst ratings | Finnhub, Yahoo Finance | Daily | All |
| News articles | Finnhub News, NewsAPI, RSS feeds | Continuous | All |
| Economic calendar | Finnhub, Trading Economics | Daily | All |
| Insider transactions | SEC EDGAR, Finnhub | Daily | Swing, Long-term |

---

## 8. Open Questions for Next Steps

- [ ] Which specific free APIs to use for each data type? (needs API comparison research)
- [ ] How much historical data to store per horizon? (suggest: 2 years daily, 3 months intraday)
- [ ] Backtesting approach — how to validate the scoring system before going live?
- [ ] Claude API cost estimation — how many agent calls per day across all horizons?
- [ ] Dashboard design — what views does the user need? (separate research task)
- [ ] How to handle the crypto allocation — same agents or separate?

---

## Sources

- [Best Technical Indicators for Day Trading (2026 Study)](https://www.newtrading.io/best-technical-indicators/)
- [6 Best Indicators for Swing Trading](https://forextester.com/blog/best-indicators-for-swing-trading)
- [100 Best Trading Indicators 2026 (With Backtests)](https://www.quantifiedstrategies.com/trading-indicators/)
- [Building a Multi-Agent AI System for Financial Market Analysis](https://www.analyticsvidhya.com/blog/2025/02/financial-market-analysis-ai-agent/)
- [AI for Stock Screening: Simplify and Accelerate the Discovery Process](https://www.aaii.com/journal/article/295387-ai-for-stock-screening-simplify-and-accelerate-the-discovery-process)
- [A Rule-Based Stock Trading Recommendation System Using Sentiment Analysis and Technical Indicators](https://www.mdpi.com/2079-9292/14/4/773)
- [TriFusion Stacking for Stock Prediction: Integrating Sentiment, Technical, and Fundamental Analysis](https://www.scirp.org/journal/paperinformation?paperid=148384)
- [Enhancing Trading Performance Through Sentiment Analysis with LLMs](https://arxiv.org/html/2507.09739v1)
- [Leveraging LLMs as News Sentiment Predictors in Stock Markets](https://link.springer.com/article/10.1007/s10791-025-09573-7)
- [Risk Management Strategies for Algo Trading](https://www.luxalgo.com/blog/risk-management-strategies-for-algo-trading/)
- [Position Sizing in Trading: Strategies, Techniques, and Formula](https://blog.quantinsti.com/position-sizing/)
- [Stop Loss Strategies for Algorithmic Trading](https://blog.traderspost.io/article/stop-loss-strategies-algorithmic-trading)
- [AI Investment Recommendations for 2025](https://www.rapidinnovation.io/post/ai-agents-for-investment-recommendations)
- [2026 Will Be the Year of Multi-Agent Systems](https://aiagentsdirectory.com/blog/2026-will-be-the-year-of-multi-agent-systems)
