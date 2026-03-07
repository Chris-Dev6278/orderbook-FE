// Wallet connection modal
import type { WalletType } from "../types";

interface Props {
    onConnect: (type: WalletType) => void;
    onClose: () => void;
}

const OPTIONS: {
    id: WalletType;
    name: string;
    sub: string;
    icon: string;
    accent: string;
}[] = [
    {
        id: "hashconnect",
        name: "WalletConnect",
        sub: "HashPack, Blade, Kabila + more",
        icon: "🔷",
        accent: "var(--cyan)"
    },
    {
        id: "metamask",
        name: "MetaMask EVM",
        sub: "Via Hedera JSON-RPC relay",
        icon: "🦊",
        accent: "var(--amber)"
    },
    {
        id: "demo",
        name: "Demo Wallet",
        sub: "Auto-funded testnet account",
        icon: "🧪",
        accent: "var(--purple)"
    }
];

const css = `
  /* Overlay */
  .wm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 300;
    display: flex;
    align-items: flex-end;      /* mobile: sheet from bottom */
    justify-content: center;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(6px);
    padding: 0;
  }

  /* Card */
  .wm-card {
    background: var(--bg1);
    border: 1px solid var(--border-accent);
    width: 100%;
    max-width: 480px;
    padding: 24px 20px 32px;
    animation: slideUp 0.25s ease;

    /* Mobile: bottom sheet with rounded top */
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  /* Desktop: centered floating card */
  @media (min-width: 600px) {
    .wm-overlay {
      align-items: center;
      padding: 20px;
    }
    .wm-card {
      border-radius: var(--radius-lg);
      max-width: 380px;
    }
  }
  
  /* Drag handle (mobile hint) */
  .wm-handle {
    width: 36px;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 0 auto 20px;
  }
  @media (min-width: 600px) {
    .wm-handle { display: none; }
  }

  /* Title */
  .wm-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 4px;
  }
  
  .wm-sub {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  /* Option row */
  .wm-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 10px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  
  .wm-option:last-child { margin-bottom: 0; }
  .wm-option:hover,
  .wm-option:active {
    background: var(--bg2);
  }

  /* Icon circle */
  .wm-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  /* Text */
  .wm-name {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 2px;
  }
  .wm-desc {
    font-size: 10px;
    color: var(--text-dim);
  }

  /* Arrow */
  .wm-arrow {
    margin-left: auto;
    color: var(--text-dim);
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Footer note */
  .wm-note {
    margin-top: 20px;
    font-size: 10px;
    color: var(--text-dim);
    text-align: center;
    line-height: 1.7;
  }
  .wm-note a { color: var(--cyan); }

  /* Cancel button — visible on mobile */
  .wm-cancel {
    width: 100%;
    margin-top: 14px;
    padding: 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  
  .wm-cancel:hover { color: var(--text); border-color: var(--text-mid); }

  @media (min-width: 600px) {
    .wm-cancel { display: none; }
  }
`;

export function WalletModal({ onConnect, onClose }: Props) {
    return (
        <>
            <style>{css}</style>
            {/* Clicking overlay close the modal*/}
            <div className="wm-overlay" onClick={onClose}>
                <div className="wm-card" onClick={e => e.stopPropagation()}>
                    <div className="wm-handle" />

                    <div className="wm-title">Connect Wallet</div>
                    <div className="wm-sub">
                        Choose how to connect to Hedera Testnet
                    </div>

                    {OPTIONS.map(o => (
                        <div
                            key={o.id}
                            className="wm-option"
                            onClick={() => onConnect(o.id)}
                        >
                            <div
                                className="wm-icon"
                                style={{ background: `${o.accent}22` }}
                            >
                                {o.icon}
                            </div>
                            <div>
                                <div className="wm-name">{o.name}</div>
                                <div className="wm-desc">{o.sub}</div>
                            </div>
                            <div className="wm-arrow">›</div>
                        </div>
                    ))}

                    <div className="wm-note">
                        No real funds needed — testnet only.
                        <br />
                        Real wallets require
                        <a
                            href="https://www.hashpack.app/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            HashPack
                        </a>{" "}
                        installed.
                    </div>
                    <button className="wm-cancel" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
}
