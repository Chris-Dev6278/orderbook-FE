// Bid / ask depth table with animated depth bars.
// Shows skeleton rows while data is loading.

import type { Orderbook as OrderbookType } from "../types";

interface Props {
    orderbook: OrderbookType | null;
    loading: boolean;
}

const css = `
  /* ── Wrapper ── */
  .ob {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    background: var(--bg1);
  }

  /* ── Header ── */
  .ob-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ob-title {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-mid);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .ob-tag {
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: var(--cyan-dim);
    color: var(--cyan);
    font-family: var(--font-mono);
  }

  /* ── Column headers ── */
  .ob-cols {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 5px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ob-col {
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }
  .ob-col:first-child { text-align: left; }

  /* ── Scrollable halves ── */
  .ob-half { overflow-y: auto; flex: 1; }

  /* ── Row ── */
  .ob-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 3px 14px;
    position: relative;
    cursor: default;
    transition: background 0.1s;
  }
  .ob-row:hover { background: rgba(255,255,255,0.025); }

  /* Depth bar sits behind the text */
  .ob-depth {
    position: absolute;
    top: 0; right: 0; bottom: 0;
    opacity: 0.1;
    transition: width 0.4s ease;
    pointer-events: none;
  }
  .ob-row.ask .ob-depth { background: var(--red); }
  .ob-row.bid .ob-depth { background: var(--green); }

  /* Cells */
  .ob-cell {
    font-size: 11px;
    text-align: right;
    position: relative; /* sit above depth bar */
    z-index: 1;
    padding: 2px 0;
    font-family: var(--font-mono);
  }
  .ob-cell:first-child     { text-align: left; font-weight: 700; }
  .ob-row.ask .ob-cell:first-child { color: var(--red);   }
  .ob-row.bid .ob-cell:first-child { color: var(--green); }
  .ob-cell:not(:first-child) { color: var(--text-mid); }

  /* ── Spread row ── */
  .ob-spread {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ob-mid {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 800;
    transition: color 0.3s;
  }
  .ob-mid.up   { color: var(--green); }
  .ob-mid.down { color: var(--red);   }
  .ob-spread-label { font-size: 10px; color: var(--text-dim); }
  .ob-spread-right {
    margin-left: auto;
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }

  /* ── Skeleton shimmer ── */
  .ob-skeleton {
    height: 20px;
    margin: 3px 14px;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      var(--bg3) 25%,
      var(--bg2) 50%,
      var(--bg3) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

function SkeletonRows({ count = 8 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="ob-skeleton"
                    style={{ opacity: 1 - i * 0.08 }}
                />
            ))}
        </>
    );
}

export function Orderbook({ orderbook, loading }: Props) {
    const asks = orderbook?.asks ?? [];
    const bids = orderbook?.bids ?? [];
    const mid = orderbook?.midPrice ?? 0;
    const priceUp = true;

    return (
        <>
            <style>{css}</style>
            <div className="ob">
                {/* Header */}
                <div className="ob-header">
                    <span className="ob-title">Orderbook</span>
                    <span className="ob-tag">HCS Verified</span>
                </div>

                {/* Column labels */}
                <div className="ob-cols">
                    <span className="ob-col">Price</span>
                    <span className="ob-col">Amount</span>
                    <span className="ob-col">Total</span>
                </div>

                {/* Asks — reversed so lowest ask sits closest to spread */}
                <div
                    className="ob-half"
                    style={{ display: "flex", flexDirection: "column-reverse" }}
                >
                    {loading ? (
                        <SkeletonRows />
                    ) : (
                        asks.slice(0, 10).map((row, i) => (
                            <div key={`ask-${i}`} className="ob-row ask">
                                <div
                                    className="ob-depth"
                                    style={{ width: `${row.depth * 100}%` }}
                                />
                                <span className="ob-cell">
                                    {row.price.toFixed(4)}
                                </span>
                                <span className="ob-cell">
                                    {row.amount.toFixed(2)}
                                </span>
                                <span className="ob-cell">
                                    {row.total.toFixed(2)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Spread */}
                <div className="ob-spread">
                    <span className={`ob-mid ${priceUp ? "up" : "down"}`}>
                        {mid > 0 ? mid.toFixed(4) : "—"}
                    </span>
                    <span className="ob-spread-label">TOKA / HBAR</span>
                    {orderbook && (
                        <span className="ob-spread-right">
                            Spread
                            <br />
                            {orderbook.spread.toFixed(4)}
                        </span>
                    )}
                </div>

                {/* Bids */}
                <div className="ob-half">
                    {loading ? (
                        <SkeletonRows />
                    ) : (
                        bids.slice(0, 10).map((row, i) => (
                            <div key={`bid-${i}`} className="ob-row bid">
                                <div
                                    className="ob-depth"
                                    style={{ width: `${row.depth * 100}%` }}
                                />
                                <span className="ob-cell">
                                    {row.price.toFixed(4)}
                                </span>
                                <span className="ob-cell">
                                    {row.amount.toFixed(2)}
                                </span>
                                <span className="ob-cell">
                                    {row.total.toFixed(2)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
