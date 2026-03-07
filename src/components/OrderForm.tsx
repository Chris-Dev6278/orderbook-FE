// Buy / Sell order entry form.
//
// Features:
//   - Buy / Sell side toggle
//   - Limit / Market type toggle
//   - Price + amount inputs with validation
//   - 25 / 50 / 75 / 100% quick-fill buttons
//   - Real-time total calculation
//   - Calls onSubmit() — parent will open confirm modal

import { useState, useEffect } from "react";
import type { OrderSide, OrderType, WalletState } from "../types";
import { addToast } from "../hooks/useToast";

export interface OrderPayload {
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    total: number;
}

interface Props {
    wallet: WalletState | null;
    midPrice: number;
    getBalance: (symbol: string) => number;
    onSubmit: (order: OrderPayload) => void;
}

const css = `
  /* ── Wrapper ── */
  .of {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    overflow-y: auto;
    flex: 1;
  }

  /* ── Side toggle (Buy / Sell) ── */
  .of-sides {
    display: flex;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .of-side {
    flex: 1;
    padding: 10px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: none;
    background: transparent;
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .of-side:not(.active):hover { color: var(--text); }
  .of-side.buy.active  { background: var(--green); color: #fff; }
  .of-side.sell.active { background: var(--red);   color: #fff; }

  /* ── Type toggle (Limit / Market) ── */
  .of-types { display: flex; gap: 6px; }
  .of-type {
    padding: 5px 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .of-type.active {
    border-color: var(--cyan);
    color: var(--cyan);
    background: var(--cyan-dim);
  }

  /* ── Field label ── */
  .of-label {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 5px;
    display: block;
  }

  /* ── Input row ── */
  .of-input-row {
    display: flex;
    align-items: center;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .of-input-row:focus-within { border-color: var(--cyan); }
  .of-input-row.error        { border-color: var(--red);  }

  .of-input {
    flex: 1;
    padding: 10px 10px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
    min-width: 0;           /* prevents overflow on mobile */
  }
  .of-input::placeholder { color: var(--text-dim); }

  .of-unit {
    padding: 0 10px;
    color: var(--text-dim);
    font-size: 11px;
    font-weight: 700;
    border-left: 1px solid var(--border);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .of-error {
    font-size: 10px;
    color: var(--red);
    margin-top: 4px;
  }

  /* ── Percentage quick-fill ── */
  .of-pcts { display: flex; gap: 5px; }
  .of-pct {
    flex: 1;
    padding: 5px 0;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.12s;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }
  .of-pct:hover  { border-color: var(--cyan); color: var(--cyan); }
  .of-pct.active { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-dim); }

  /* ── Summary rows ── */
  .of-divider { height: 1px; background: var(--border); margin: 2px 0; }

  .of-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--text-dim);
  }
  .of-row-val         { color: var(--text); font-weight: 700; }
  .of-row-val.green   { color: var(--green); }
  .of-row-val.cyan    { color: var(--cyan);  }

  /* ── Submit button ── */
  .of-submit {
    width: 100%;
    padding: 12px;
    border-radius: var(--radius);
    border: none;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;       /* comfortable tap target */
  }
  .of-submit.buy  { background: var(--green); color: #fff; }
  .of-submit.sell { background: var(--red);   color: #fff; }
  .of-submit:disabled { opacity: 0.4; cursor: not-allowed; }
  .of-submit:not(:disabled):active { transform: scale(0.99); }

  /* ── Bottom note ── */
  .of-note {
    font-size: 10px;
    color: var(--text-dim);
    text-align: center;
    line-height: 1.7;
  }
  .of-note strong { color: var(--cyan); }
`;

export function OrderForm({ wallet, midPrice, getBalance, onSubmit }: Props) {
    const [side, setSide] = useState<OrderSide>("buy");
    const [type, setType] = useState<OrderType>("limit");
    const [price, setPrice] = useState(midPrice.toFixed(4));
    const [amount, setAmount] = useState("");
    const [pct, setPct] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ price?: string; amount?: string }>(
        {}
    );

    // Sync price input when midPrice changes externally
    // but only if user hasn't manually edited it
    const [priceEdited, setPriceEdited] = useState(false);
    useEffect(() => {
        if (!priceEdited) setPrice(midPrice.toFixed(4));
    }, [midPrice, priceEdited]);

    // Reset amount when side changes
    useEffect(() => {
        setAmount("");
        setPct(null);
        setErrors({});
    }, [side]);

    const hbarBal = getBalance("HBAR");
    const tokaBal = getBalance("TOKA");

    // Max amount the user can buy or sell
    const maxAmount =
        side === "buy"
            ? hbarBal / (+price || 1) // how much TOKA can we afford
            : tokaBal; // how much TOKA do we have

    const total = +(+price * +amount).toFixed(6);

    // ── % quick fill ───────────────────────────────────────
    function handlePct(p: number) {
        setPct(p);
        setAmount(((maxAmount * p) / 100).toFixed(2));
        setErrors({});
    }

    // ── Validation ─────────────────────────────────────────
    function validate(): boolean {
        const errs: typeof errors = {};

        if (type === "limit") {
            if (!price || +price <= 0) errs.price = "Enter a valid price";
        }
        if (!amount || +amount <= 0) {
            errs.amount = "Enter a valid amount";
        } else if (side === "buy" && total > hbarBal) {
            errs.amount = "Insufficient HBAR balance";
        } else if (side === "sell" && +amount > tokaBal) {
            errs.amount = "Insufficient TOKA balance";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ── Submit ─────────────────────────────────────────────
    function handleSubmit() {
        if (!wallet) {
            addToast({
                type: "error",
                title: "Not Connected",
                msg: "Connect your wallet first."
            });
            return;
        }
        if (!validate()) return;
        onSubmit({ side, type, price: +price, amount: +amount, total });
    }

    return (
        <>
            <style>{css}</style>
            <div className="of">
                {/* Buy / Sell */}
                <div className="of-sides">
                    {(["buy", "sell"] as OrderSide[]).map(s => (
                        <button
                            key={s}
                            className={`of-side ${s} ${side === s ? "active" : ""}`}
                            onClick={() => setSide(s)}
                        >
                            {s === "buy" ? "BUY" : "SELL"}
                        </button>
                    ))}
                </div>

                {/* Limit / Market */}
                <div className="of-types">
                    {(["limit", "market"] as OrderType[]).map(t => (
                        <button
                            key={t}
                            className={`of-type ${type === t ? "active" : ""}`}
                            onClick={() => setType(t)}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Price — limit only */}
                {type === "limit" && (
                    <div>
                        <label className="of-label">Price</label>
                        <div
                            className={`of-input-row ${errors.price ? "error" : ""}`}
                        >
                            <input
                                className="of-input"
                                type="number"
                                inputMode="decimal"
                                value={price}
                                placeholder="0.0000"
                                onChange={e => {
                                    setPrice(e.target.value);
                                    setPriceEdited(true);
                                    setErrors(v => ({
                                        ...v,
                                        price: undefined
                                    }));
                                }}
                            />
                            <span className="of-unit">HBAR</span>
                        </div>
                        {errors.price && (
                            <div className="of-error">{errors.price}</div>
                        )}
                    </div>
                )}

                {/* Amount */}
                <div>
                    <label className="of-label">Amount</label>
                    <div
                        className={`of-input-row ${errors.amount ? "error" : ""}`}
                    >
                        <input
                            className="of-input"
                            type="number"
                            inputMode="decimal"
                            value={amount}
                            placeholder="0.00"
                            onChange={e => {
                                setAmount(e.target.value);
                                setPct(null);
                                setErrors(v => ({ ...v, amount: undefined }));
                            }}
                        />
                        <span className="of-unit">TOKA</span>
                    </div>
                    {errors.amount && (
                        <div className="of-error">{errors.amount}</div>
                    )}
                </div>

                {/* % quick-fill */}
                <div className="of-pcts">
                    {[25, 50, 75, 100].map(p => (
                        <button
                            key={p}
                            className={`of-pct ${pct === p ? "active" : ""}`}
                            onClick={() => handlePct(p)}
                        >
                            {p}%
                        </button>
                    ))}
                </div>

                <div className="of-divider" />

                {/* Summary */}
                <div className="of-row">
                    <span>Total</span>
                    <span className={`of-row-val ${total > 0 ? "green" : ""}`}>
                        {total > 0 ? `${total} HBAR` : "—"}
                    </span>
                </div>
                <div className="of-row">
                    <span>Available</span>
                    <span className="of-row-val">
                        {side === "buy"
                            ? `${hbarBal.toFixed(2)} HBAR`
                            : `${tokaBal.toFixed(2)} TOKA`}
                    </span>
                </div>
                <div className="of-row">
                    <span>Hedera fee</span>
                    <span className="of-row-val cyan">≈ 0.0001 HBAR</span>
                </div>

                <div className="of-divider" />

                {/* Submit */}
                <button
                    className={`of-submit ${side}`}
                    onClick={handleSubmit}
                    disabled={!wallet}
                >
                    {wallet
                        ? `${side === "buy" ? "Buy" : "Sell"} TOKA`
                        : "Connect Wallet to Trade"}
                </button>

                <div className="of-note">
                    Orders are <strong>timestamped on HCS</strong> before
                    matching.
                    <br />
                    Settlement uses <strong>atomic cryptoTransfer</strong>.
                </div>
            </div>
        </>
    );
}
