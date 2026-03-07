// Live HCS audit log — new messages flash in at the top.

import type { HCSMessage } from "../types";

interface Props {
    messages: HCSMessage[];
}

const css = `
  .hl { display: flex; flex-direction: column; overflow: hidden; flex: 1; }

  .hl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .hl-title {
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    color: var(--text-mid); letter-spacing: 1px; text-transform: uppercase;
  }
  .hl-live {
    display: flex; align-items: center; gap: 5px;
    font-size: 10px; color: var(--green); font-family: var(--font-mono);
  }
  .hl-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); animation: pulse 2s infinite; flex-shrink: 0;
  }

  .hl-body { overflow-y: auto; flex: 1; }

  .hl-entry {
    padding: 9px 14px;
    border-bottom: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 3px;
    transition: background 0.1s;
  }
  .hl-entry:hover { background: rgba(255,255,255,0.015); }
  .hl-entry.new   { animation: rowFlash 1s ease forwards; }

  .hl-row1 { display: flex; align-items: center; gap: 6px; }

  .hl-seq  { font-size: 10px; color: var(--text-dim); font-family: var(--font-mono); }
  .hl-ts   { margin-left: auto; font-size: 10px; color: var(--text-dim); font-family: var(--font-mono); }

  /* Type badge */
  .hl-type {
    font-size: 9px; font-weight: 700; padding: 2px 6px;
    border-radius: 3px; letter-spacing: 0.5px; font-family: var(--font-mono);
  }
  .hl-type.ORDER_PLACED      { background: var(--purple-dim); color: var(--purple); }
  .hl-type.ORDER_CANCELLED   { background: var(--red-dim);    color: var(--red);    }
  .hl-type.TRADE_MATCHED     { background: var(--green-dim);  color: var(--green);  }
  .hl-type.SETTLEMENT_ATOMIC { background: var(--cyan-dim);   color: var(--cyan);   }
  .hl-type.TOKEN_MINTED      { background: rgba(245,158,11,.15); color: var(--amber); }

  .hl-topic  { font-size: 9px; color: var(--cyan); opacity: 0.6; font-family: var(--font-mono); }
  .hl-detail { font-size: 10px; color: var(--text-mid); font-family: var(--font-mono); }
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
        return `Tx ${String(d.txId).slice(-12)} — ${d.status}`;
    if (m.type === "TOKEN_MINTED")
        return `+${d.amount} ${d.symbol} → ${String(d.to).slice(0, 12)}`;
    return JSON.stringify(m.data).slice(0, 48);
}

export function HCSLog({ messages }: Props) {
    return (
        <>
            <style>{css}</style>
            <div className="hl">
                <div className="hl-header">
                    <span className="hl-title">HCS Audit Log</span>
                    <div className="hl-live">
                        <div className="hl-dot" />
                        LIVE
                    </div>
                </div>
                <div className="hl-body">
                    {messages.map((m, i) => (
                        <div
                            key={m.id}
                            className={`hl-entry ${i === 0 ? "new" : ""}`}
                        >
                            <div className="hl-row1">
                                <span className="hl-seq">#{m.seqNo}</span>
                                <span className={`hl-type ${m.type}`}>
                                    {m.type.replace(/_/g, " ")}
                                </span>
                                <span className="hl-ts">
                                    {fmtTime(m.consensusTimestamp)}
                                </span>
                            </div>
                            <span className="hl-topic">{m.topicId}</span>
                            <span className="hl-detail">{fmtData(m)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
