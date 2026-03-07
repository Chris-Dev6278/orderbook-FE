// Scrollable list of recent matched trades.

import type { Trade } from "../types";

interface Props {
    trades: Trade[];
}

const css = `
  .tl { display: flex; flex-direction: column; overflow: hidden; flex: 1; }

  .tl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .tl-title {
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    color: var(--text-mid); letter-spacing: 1px; text-transform: uppercase;
  }
  .tl-tag {
    padding: 2px 7px; border-radius: 3px; font-size: 9px; font-weight: 700;
    letter-spacing: 0.5px; font-family: var(--font-mono);
    background: var(--green-dim); color: var(--green);
  }

  .tl-cols {
    display: grid; grid-template-columns: 1fr 1fr 56px;
    padding: 5px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .tl-col { font-size: 10px; color: var(--text-dim); text-align: right; }
  .tl-col:first-child { text-align: left; }

  .tl-body { overflow-y: auto; flex: 1; }

  .tl-row {
    display: grid; grid-template-columns: 1fr 1fr 56px;
    padding: 3px 14px; transition: background 0.1s;
  }
  .tl-row:hover { background: rgba(255,255,255,0.02); }

  .tl-price { font-size: 11px; font-weight: 700; font-family: var(--font-mono); }
  .tl-price.buy  { color: var(--green); }
  .tl-price.sell { color: var(--red);   }

  .tl-amount {
    font-size: 11px; color: var(--text-mid);
    text-align: right; font-family: var(--font-mono);
  }
  .tl-time {
    font-size: 10px; color: var(--text-dim);
    text-align: right; font-family: var(--font-mono);
  }
`;

function fmt(d: Date) {
    return d.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

export function TradeList({ trades }: Props) {
    return (
        <>
            <style>{css}</style>
            <div className="tl">
                <div className="tl-header">
                    <span className="tl-title">Recent Trades</span>
                    <span className="tl-tag">Atomic</span>
                </div>
                <div className="tl-cols">
                    <span className="tl-col">Price</span>
                    <span className="tl-col">Amount</span>
                    <span className="tl-col">Time</span>
                </div>
                <div className="tl-body">
                    {trades.map(t => (
                        <div key={t.id} className="tl-row">
                            <span className={`tl-price ${t.side}`}>
                                {t.price.toFixed(4)}
                            </span>
                            <span className="tl-amount">
                                {t.amount.toFixed(2)}
                            </span>
                            <span className="tl-time">{fmt(t.executedAt)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
