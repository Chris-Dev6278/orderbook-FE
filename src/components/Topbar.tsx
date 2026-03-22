// Mobile  (<600px): logo | nav | wallet button only
// Tablet  (600px+): adds price ticker
// Desktop (900px+): adds network badge

import type { WalletState } from "../types";

type Page = "dex" | "faucet" | "admin";

interface Props {
    page: Page;
    onNav: (p: Page) => void;
    midPrice: number;
    priceUp: boolean;
    wallet: WalletState | null;
    onWalletClick: () => void;
    onDisconnect: () => void;
}

const NAV: { id: Page; label: string }[] = [
    { id: "dex", label: "Trade" },
    { id: "faucet", label: "Faucet" },
    { id: "admin", label: "Admin" }
];

const css = `
  .tb {
    display: flex;
    align-items: center;
    height: 52px;
    padding: 0 12px;
    background: var(--bg1);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    z-index: 100;
    gap: 8px;
  }

  .tb-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.5px;
    user-select: none;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tb-logo-dot {
    width: 7px;
    height: 7px;
    background: var(--cyan);
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  .tb-nav {
    display: flex;
    gap: 2px;
    flex: 1;
    overflow: hidden;
  }
  .tb-nav-btn {
    padding: 6px 10px;
    border-radius: var(--radius);
    border: none;
    background: transparent;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .tb-nav-btn:hover  { color: var(--text); background: var(--bg3); }
  .tb-nav-btn.active { color: var(--cyan); background: var(--cyan-dim); }

  .tb-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .tb-ticker {
    display: none;
    align-items: center;
    gap: 7px;
    padding: 5px 10px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 11px;
    white-space: nowrap;
  }
  .tb-ticker-pair  { font-weight: 700; color: var(--text); }
  .tb-ticker-price { font-weight: 700; transition: color 0.3s; }
  .tb-ticker-price.up   { color: var(--green); }
  .tb-ticker-price.down { color: var(--red);   }
  .tb-ticker-change { font-size: 10px; color: var(--text-dim); }

  @media (min-width: 600px) {
    .tb-ticker { display: flex; }
  }

  .tb-net {
    display: none;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    color: var(--text-dim);
    white-space: nowrap;
  }
  .tb-net-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  @media (min-width: 900px) {
    .tb-net { display: flex; }
  }

  .tb-wallet {
    padding: 7px 12px;
    border-radius: var(--radius);
    border: 1px solid;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    min-height: 36px;
  }
  .tb-wallet.off {
    border-color: var(--cyan);
    color: var(--cyan);
    background: var(--cyan-dim);
  }
  .tb-wallet.off:hover { background: var(--cyan); color: var(--bg); }
  .tb-wallet.on {
    border-color: var(--green);
    color: var(--green);
    background: var(--green-dim);
  }

  .tb-disconnect {
    width: 28px;
    height: 28px;
    border-radius: var(--radius);
    border: 1px solid var(--red-dim);
    background: transparent;
    color: var(--red);
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .tb-disconnect:hover { background: var(--red-dim); }

  .tb-wallet-full  { display: none; }
  .tb-wallet-short { display: inline; }

  @media (min-width: 480px) {
    .tb-wallet-full  { display: inline; }
    .tb-wallet-short { display: none; }
    .tb { padding: 0 16px; }
  }
`;

export function Topbar({
    page,
    onNav,
    midPrice,
    priceUp,
    wallet,
    onWalletClick,
    onDisconnect
}: Props) {
    const shortId = wallet?.accountId.split(".").pop() ?? "";
    const fullId = wallet ? wallet.accountId.slice(0, 13) + "…" : "";

    return (
        <>
            <style>{css}</style>
            <header className="tb">
                <div className="tb-logo">
                    <div className="tb-logo-dot" />
                    OrderbookDex
                </div>

                <nav className="tb-nav">
                    {NAV.map(n => (
                        <button
                            key={n.id}
                            className={`tb-nav-btn ${page === n.id ? "active" : ""}`}
                            onClick={() => onNav(n.id)}
                        >
                            {n.label}
                        </button>
                    ))}
                </nav>

                <div className="tb-right">
                    <div className="tb-ticker">
                        <span className="tb-ticker-pair">TOKA/HBAR</span>
                        <span
                            className={`tb-ticker-price ${priceUp ? "up" : "down"}`}
                        >
                            {midPrice.toFixed(4)}
                        </span>
                        <span className="tb-ticker-change">
                            {priceUp ? "▲" : "▼"} 0.12%
                        </span>
                    </div>

                    <div className="tb-net">
                        <div className="tb-net-dot" />
                        <span>Testnet</span>
                    </div>

                    <button
                        className={`tb-wallet ${wallet ? "on" : "off"}`}
                        onClick={onWalletClick}
                    >
                        {wallet ? (
                            <>
                                <span className="tb-wallet-short">
                                    {shortId}
                                </span>
                                <span className="tb-wallet-full">{fullId}</span>
                            </>
                        ) : (
                            <>
                                <span className="tb-wallet-short">Connect</span>
                                <span className="tb-wallet-full">
                                    Connect Wallet
                                </span>
                            </>
                        )}
                    </button>

                    {wallet && (
                        <button
                            className="tb-disconnect"
                            onClick={onDisconnect}
                            title="Disconnect wallet"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </header>
        </>
    );
}
