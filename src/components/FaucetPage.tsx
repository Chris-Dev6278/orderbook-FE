// Mint testnet HTS tokens for demo purposes.
// Each mint call will hit backend which uses @hashgraph/sdk
// to create a real HTS transaction on testnet.

import { useState } from "react";
import type { WalletState } from "../types";
import { addToast } from "../hooks/useToast";

interface Props {
  wallet: WalletState | null;
  getBalance: (symbol: string) => number;
  onMint: (symbol: string, amount: number) => Promise<void>;
}

const TOKENS = [
  {
    symbol:  "HBAR",
    name:    "Hedera HBAR",
    icon:    "ℏ",
    tokenId: "Native",
    color:   "var(--cyan)",
    bg:      "var(--cyan-dim)",
    amount:  1000,
  },
  {
    symbol:  "TOKA",
    name:    "Demo Token A",
    icon:    "A",
    tokenId: "0.0.4100001",
    color:   "var(--purple)",
    bg:      "var(--purple-dim)",
    amount:  5000,
  },
  {
    symbol:  "TOKB",
    name:    "Demo Token B",
    icon:    "B",
    tokenId: "0.0.4100002",
    color:   "var(--amber)",
    bg:      "rgba(245,158,11,0.15)",
    amount:  5000,
  },
] as const;

const css = `
  /* ── Page shell ── */
  .fp {
    flex: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: 24px 16px 40px;
  }

  /* ── Card ── */
  .fp-card {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 20px;
    width: 100%;
    max-width: 480px;
    height: fit-content;
  }

  /* ── Card header ── */
  .fp-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 6px;
  }
  .fp-sub {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.7;
    margin-bottom: 24px;
  }

  /* ── Token row ── */
  .fp-token {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 10px;
    transition: border-color 0.15s;
  }
  .fp-token:last-of-type { margin-bottom: 0; }
  .fp-token:hover { border-color: rgba(255,255,255,0.12); }

  /* Icon circle */
  .fp-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* Token info */
  .fp-info { flex: 1; min-width: 0; }
  .fp-token-name {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .fp-token-id {
    font-size: 10px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  /* Balance */
  .fp-bal {
    font-size: 13px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-mid);
    flex-shrink: 0;
  }

  /* Mint button */
  .fp-btn {
    padding: 8px 14px;
    border-radius: var(--radius);
    border: 1px solid;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
    min-width: 64px;
    min-height: 36px;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }
  .fp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .fp-btn:not(:disabled):active { transform: scale(0.97); }

  /* ── Divider ── */
  .fp-divider {
    height: 1px;
    background: var(--border);
    margin: 20px 0;
  }

  /* ── Info section ── */
  .fp-info-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.6;
  }
  .fp-info-row:last-child { margin-bottom: 0; }
  .fp-info-tag {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-family: var(--font-mono);
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Not connected notice ── */
  .fp-notice {
    margin-top: 16px;
    padding: 12px 14px;
    background: var(--red-dim);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: var(--radius);
    font-size: 11px;
    color: var(--red);
    text-align: center;
    line-height: 1.6;
  }
`;

export function FaucetPage({ wallet, getBalance, onMint }: Props) {
  // Track which token is currently minting
  const [minting, setMinting] = useState<string | null>(null);

  async function handleMint(symbol: string, amount: number) {
    if (!wallet) {
      addToast({ type: "error", title: "Not Connected", msg: "Connect your wallet first." });
      return;
    }
    setMinting(symbol);
    try {
      await onMint(symbol, amount);
    } finally {
      setMinting(null);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="fp">
        <div className="fp-card">

          {/* Header */}
          <div className="fp-title">🚰 Testnet Faucet</div>
          <p className="fp-sub">
            Mint demo tokens for testing the DEX. Each mint creates a real
            Hedera Token Service transaction on testnet and logs it on HCS.
          </p>

          {/* Token rows */}
          {TOKENS.map(t => (
            <div key={t.symbol} className="fp-token">

              {/* Icon */}
              <div
                className="fp-icon"
                style={{ background: t.bg, color: t.color }}
              >
                {t.icon}
              </div>

              {/* Name + token ID */}
              <div className="fp-info">
                <div
                  className="fp-token-name"
                  style={{ color: t.color }}
                >
                  {t.symbol}
                </div>
                <div className="fp-token-id">{t.tokenId}</div>
              </div>

              {/* Current balance */}
              <div className="fp-bal">
                {getBalance(t.symbol).toFixed(2)}
              </div>

              {/* Mint button */}
              <button
                className="fp-btn"
                style={{
                  borderColor: t.color,
                  color:       t.color,
                  background:  t.bg,
                }}
                disabled={!wallet || minting === t.symbol}
                onClick={() => handleMint(t.symbol, t.amount)}
              >
                {minting === t.symbol ? "…" : `+${t.amount}`}
              </button>

            </div>
          ))}

          {/* Not connected warning */}
          {!wallet && (
            <div className="fp-notice">
              Connect your wallet to use the faucet
            </div>
          )}

          <div className="fp-divider" />

          {/* How it works */}
          <div className="fp-info-row">
            <span
              className="fp-info-tag"
              style={{ background: "var(--purple-dim)", color: "var(--purple)" }}
            >
              HTS
            </span>
            Tokens created via @hashgraph/sdk on the backend.
            Each mint is a real fungible token transfer on Hedera Testnet.
          </div>
          <div className="fp-info-row">
            <span
              className="fp-info-tag"
              style={{ background: "var(--cyan-dim)", color: "var(--cyan)" }}
            >
              HCS
            </span>
            Every mint event is recorded on topic{" "}
            <span style={{ color: "var(--cyan)" }}>0.0.4829301</span>{" "}
            for a full immutable audit trail.
          </div>
          <div className="fp-info-row">
            <span
              className="fp-info-tag"
              style={{ background: "var(--green-dim)", color: "var(--green)" }}
            >
              SAFE
            </span>
            Testnet only — no real funds involved.
            Safe to mint as many times as needed for demo.
          </div>

        </div>
      </div>
    </>
  );
}