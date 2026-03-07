// Audit dashboard for admins.
// Shows: stats, full HCS stream, all balances, recent trades table.

import type { Trade, HCSMessage, WalletState } from "../types";

interface Props {
    trades: Trade[];
    hcsMessages: HCSMessage[];
    wallet: WalletState | null;
    getBalance: (symbol: string) => number;
}

const css = `
  /* ── Page shell ── */
  .ap {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ── Page title ── */
  .ap-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
  }
  .ap-subtitle {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  /* ── Stats grid ── */
  .ap-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  @media (min-width: 600px) {
    .ap-stats { grid-template-columns: repeat(4, 1fr); }
  }

  .ap-stat {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ap-stat-label {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-family: var(--font-mono);
  }
  .ap-stat-value {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
  }
  .ap-stat-sub {
    font-size: 10px;
    color: var(--text-dim);
  }

  /* ── Section ── */
  .ap-section-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    color: var(--text-mid);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* ── Card shell (shared by HCS + trades) ── */
  .ap-card {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  /* ── HCS topic bar ── */
  .ap-topic-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 8px;
  }
  .ap-topic-label {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }
  .ap-topic-id {
    font-size: 12px;
    color: var(--cyan);
    font-family: var(--font-mono);
    font-weight: 700;
  }
  .ap-live {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
    font-size: 10px;
    color: var(--green);
    font-family: var(--font-mono);
  }
  .ap-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }

  /* ── HCS entry ── */
  .ap-entry {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background 0.1s;
  }
  .ap-entry:last-child { border-bottom: none; }
  .ap-entry:hover { background: rgba(255,255,255,0.015); }
  .ap-entry.new { animation: rowFlash 1s ease forwards; }

  .ap-entry-row1 {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ap-entry-seq {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }
  .ap-entry-ts {
    margin-left: auto;
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }
  .ap-entry-type {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.5px;
    font-family: var(--font-mono);
  }
  .ap-entry-type.ORDER_PLACED      { background: var(--purple-dim); color: var(--purple); }
  .ap-entry-type.ORDER_CANCELLED   { background: var(--red-dim);    color: var(--red);    }
  .ap-entry-type.TRADE_MATCHED     { background: var(--green-dim);  color: var(--green);  }
  .ap-entry-type.SETTLEMENT_ATOMIC { background: var(--cyan-dim);   color: var(--cyan);   }
  .ap-entry-type.TOKEN_MINTED      { background: rgba(245,158,11,.15); color: var(--amber); }

  .ap-entry-topic {
    font-size: 9px;
    color: var(--cyan);
    opacity: 0.6;
    font-family: var(--font-mono);
  }
  .ap-entry-data {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    word-break: break-all;
  }

  /* ── Balances grid ── */
  .ap-balances {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
  }
  .ap-balance-cell {
    background: var(--bg1);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }
  .ap-balance-sym {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-family: var(--font-mono);
  }
  .ap-balance-val {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
  }

  /* ── Trades table ── */
  .ap-trades-cols {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 80px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .ap-trades-col {
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }
  .ap-trades-col:first-child { text-align: left; }

  .ap-trade-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 80px;
    padding: 6px 16px;
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
  }
  .ap-trade-row:last-child { border-bottom: none; }
  .ap-trade-row:hover { background: rgba(255,255,255,0.02); }

  .ap-trade-price {
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
  }
  .ap-trade-price.buy  { color: var(--green); }
  .ap-trade-price.sell { color: var(--red);   }

  .ap-trade-cell {
    font-size: 11px;
    color: var(--text-mid);
    text-align: right;
    font-family: var(--font-mono);
  }

  /* ── Empty state ── */
  .ap-empty {
    padding: 24px;
    text-align: center;
    color: var(--text-dim);
    font-size: 11px;
    font-family: var(--font-mono);
  }
`;

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function fmtData(m: HCSMessage): string {
    const d = m.data as Record<string, unknown>;
    if (m.type === "ORDER_PLACED")
        return `${String(d.side).toUpperCase()} ${d.amount} TOKA @ ${d.price} HBAR`;
    if (m.type === "TRADE_MATCHED")
        return `${d.amount} TOKA matched @ ${d.price}`;
    if (m.type === "SETTLEMENT_ATOMIC")
        return `Tx ${String(d.txId).slice(-14)} — ${d.status}`;
    if (m.type === "TOKEN_MINTED")
        return `+${d.amount} ${d.symbol} → ${String(d.to).slice(0, 14)}`;
    return JSON.stringify(m.data).slice(0, 60);
}

export function AdminPage({ trades, hcsMessages, wallet, getBalance }: Props) {
    const totalVol = trades.reduce((s, t) => s + t.price * t.amount, 0);
    const buyCount = trades.filter(t => t.side === "buy").length;
    const sellCount = trades.filter(t => t.side === "sell").length;

    const BALANCES = [
        { sym: "HBAR", color: "var(--cyan)" },
        { sym: "TOKA", color: "var(--purple)" },
        { sym: "TOKB", color: "var(--amber)" }
    ];

    return (
        <>
            <style>{css}</style>
            <div className="ap">
                {/* Title */}
                <div>
                    <div className="ap-title">Admin — Audit Dashboard</div>
                    <div className="ap-subtitle">
                        Live view of all HCS messages, trades, and balances on
                        Hedera Testnet
                    </div>
                </div>

                {/* Stats */}
                <div className="ap-stats">
                    {[
                        {
                            label: "Total Trades",
                            value: trades.length,
                            sub: "all time",
                            color: "var(--text)"
                        },
                        {
                            label: "Volume",
                            value: totalVol.toFixed(0),
                            sub: "HBAR total",
                            color: "var(--cyan)"
                        },
                        {
                            label: "HCS Messages",
                            value: hcsMessages.length,
                            sub: "immutable log",
                            color: "var(--purple)"
                        },
                        {
                            label: "Buy / Sell",
                            value: `${buyCount}/${sellCount}`,
                            sub: "ratio",
                            color: "var(--green)"
                        }
                    ].map(s => (
                        <div key={s.label} className="ap-stat">
                            <div className="ap-stat-label">{s.label}</div>
                            <div
                                className="ap-stat-value"
                                style={{ color: s.color }}
                            >
                                {s.value}
                            </div>
                            <div className="ap-stat-sub">{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Balances */}
                <div>
                    <div className="ap-section-title">Wallet Balances</div>
                    <div className="ap-card">
                        {wallet ? (
                            <div className="ap-balances">
                                {BALANCES.map(b => (
                                    <div
                                        key={b.sym}
                                        className="ap-balance-cell"
                                    >
                                        <span className="ap-balance-sym">
                                            {b.sym}
                                        </span>
                                        <span
                                            className="ap-balance-val"
                                            style={{ color: b.color }}
                                        >
                                            {getBalance(b.sym).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="ap-empty">
                                Connect wallet to view balances
                            </div>
                        )}
                    </div>
                </div>

                {/* HCS stream */}
                <div>
                    <div className="ap-section-title">HCS Topic Stream</div>
                    <div className="ap-card">
                        <div className="ap-topic-bar">
                            <span className="ap-topic-label">TOPIC</span>
                            <span className="ap-topic-id">0.0.4829301</span>
                            <div className="ap-live">
                                <div className="ap-live-dot" />
                                LIVE
                            </div>
                        </div>
                        {hcsMessages.slice(0, 15).map((m, i) => (
                            <div
                                key={m.id}
                                className={`ap-entry ${i === 0 ? "new" : ""}`}
                            >
                                <div className="ap-entry-row1">
                                    <span className="ap-entry-seq">
                                        SEQ #{m.seqNo}
                                    </span>
                                    <span className={`ap-entry-type ${m.type}`}>
                                        {m.type.replace(/_/g, " ")}
                                    </span>
                                    <span className="ap-entry-ts">
                                        {fmtTime(m.consensusTimestamp)}
                                    </span>
                                </div>
                                <span className="ap-entry-topic">
                                    {m.topicId}
                                </span>
                                <span className="ap-entry-data">
                                    {fmtData(m)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent trades */}
                <div>
                    <div className="ap-section-title">Recent Trades</div>
                    <div className="ap-card">
                        <div className="ap-trades-cols">
                            <span className="ap-trades-col">Price</span>
                            <span className="ap-trades-col">Amount</span>
                            <span className="ap-trades-col">Total</span>
                            <span className="ap-trades-col">Time</span>
                        </div>
                        {trades.slice(0, 15).map(t => (
                            <div key={t.id} className="ap-trade-row">
                                <span className={`ap-trade-price ${t.side}`}>
                                    {t.price.toFixed(4)}
                                </span>
                                <span className="ap-trade-cell">
                                    {t.amount.toFixed(2)}
                                </span>
                                <span className="ap-trade-cell">
                                    {(t.price * t.amount).toFixed(2)}
                                </span>
                                <span className="ap-trade-cell">
                                    {t.executedAt.toLocaleTimeString("en-US", {
                                        hour12: false,
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit"
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
