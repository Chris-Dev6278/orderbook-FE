// Order confirmation dialog.
// Shows all order details + Hedera-specific info before submitting.

import type { OrderPayload } from "./OrderForm";

interface Props {
    order: OrderPayload;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

const css = `
  .cm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 300;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(6px);
    padding: 0;
  }
  .cm-card {
    background: var(--bg1);
    border: 1px solid var(--border-accent);
    width: 100%; max-width: 480px;
    padding: 24px 20px 32px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation: slideUp 0.25s ease;
  }
  @media (min-width: 600px) {
    .cm-overlay { align-items: center; padding: 20px; }
    .cm-card    { border-radius: var(--radius-lg); max-width: 400px; }
  }

  .cm-handle {
    width: 36px; height: 4px;
    background: var(--border); border-radius: 2px;
    margin: 0 auto 20px;
  }
  @media (min-width: 600px) { .cm-handle { display: none; } }

  .cm-title {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 800; color: var(--text);
    margin-bottom: 16px;
  }

  /* Info sections */
  .cm-section {
    background: var(--bg3); border-radius: var(--radius);
    padding: 14px; margin-bottom: 10px;
  }
  .cm-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; margin-bottom: 8px;
  }
  .cm-row:last-child { margin-bottom: 0; }
  .cm-row-label { color: var(--text-dim); }
  .cm-row-val   { font-weight: 700; color: var(--text); }
  .cm-row-val.green { color: var(--green); }
  .cm-row-val.red   { color: var(--red);   }
  .cm-row-val.cyan  { color: var(--cyan);  }

  /* Notice */
  .cm-notice {
    font-size: 10px; color: var(--text-dim);
    line-height: 1.7; margin-bottom: 16px;
  }
  .cm-notice strong { color: var(--cyan); }

  /* Buttons */
  .cm-btns { display: flex; gap: 10px; }
  .cm-cancel {
    flex: 1; padding: 12px;
    border-radius: var(--radius); border: 1px solid var(--border);
    background: transparent; color: var(--text-dim);
    font-family: var(--font-mono); font-size: 12px;
    cursor: pointer; transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }
  .cm-cancel:hover { color: var(--text); border-color: var(--text-mid); }

  .cm-confirm {
    flex: 2; padding: 12px;
    border-radius: var(--radius); border: none;
    font-family: var(--font-display); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }
  .cm-confirm.buy  { background: var(--green); color: #fff; }
  .cm-confirm.sell { background: var(--red);   color: #fff; }
  .cm-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export function ConfirmModal({ order, onConfirm, onCancel, loading }: Props) {
    return (
        <>
            <style>{css}</style>
            <div className="cm-overlay" onClick={onCancel}>
                <div className="cm-card" onClick={e => e.stopPropagation()}>
                    <div className="cm-handle" />
                    <div className="cm-title">Confirm Order</div>

                    {/* Order details */}
                    <div className="cm-section">
                        <div className="cm-row">
                            <span className="cm-row-label">Side</span>
                            <span
                                className={`cm-row-val ${order.side === "buy" ? "green" : "red"}`}
                            >
                                {order.side.toUpperCase()}{" "}
                                {order.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Pair</span>
                            <span className="cm-row-val">TOKA / HBAR</span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Price</span>
                            <span className="cm-row-val">
                                {order.price.toFixed(4)} HBAR
                            </span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Amount</span>
                            <span className="cm-row-val">
                                {order.amount.toFixed(2)} TOKA
                            </span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Total</span>
                            <span className="cm-row-val green">
                                {order.total.toFixed(4)} HBAR
                            </span>
                        </div>
                    </div>

                    {/* Hedera details */}
                    <div className="cm-section">
                        <div className="cm-row">
                            <span className="cm-row-label">Network</span>
                            <span className="cm-row-val cyan">
                                Hedera Testnet
                            </span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">HCS Topic</span>
                            <span className="cm-row-val">0.0.4829301</span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Settlement</span>
                            <span className="cm-row-val cyan">
                                Atomic cryptoTransfer
                            </span>
                        </div>
                        <div className="cm-row">
                            <span className="cm-row-label">Est. fee</span>
                            <span className="cm-row-val">≈ 0.0001 HBAR</span>
                        </div>
                    </div>

                    <p className="cm-notice">
                        Your order will be <strong>timestamped on HCS</strong>{" "}
                        before matching — preventing front-running. Settlement
                        uses an <strong>atomic cryptoTransfer</strong>: both
                        token legs execute in one transaction or neither does.
                    </p>

                    <div className="cm-btns">
                        <button
                            className="cm-cancel"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`cm-confirm ${order.side}`}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting…"
                                : `Confirm ${order.side === "buy" ? "Buy" : "Sell"}`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
