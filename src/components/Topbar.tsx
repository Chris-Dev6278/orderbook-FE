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

  /* ── Logo ── */
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

  /* ── Nav ── */
  .tb-nav {
    display: flex;
    gap: 2px;
    flex: 1;                /* pushes right side to the edge */
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

  /* ── Right group ── */
  .tb-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Price ticker — hidden on mobile ── */
  .tb-ticker {
    display: none;          /* hidden by default (mobile) */
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
  .tb-ticker-price.down { color: var(--red); }
  .tb-ticker-change { font-size: 10px; color: var(--text-dim); }

  /* Show ticker on tablet+ */
  @media (min-width: 600px) {
    .tb-ticker { display: flex; }
  }

  /* ── Network badge — hidden on mobile + tablet ── */
  .tb-net {
    display: none;          /* hidden on mobile */
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

  /* Show network badge on desktop */
  @media (min-width: 900px) {
    .tb-net { display: flex; }
  }

  /* ── Wallet button ── */
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
    /* Slightly wider tap target on mobile */
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

  /* On mobile: show only a short account ID */
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
    onWalletClick
}: Props) {
    // Long form:  "0.0.9999999"
    // Short form: "9999999" (just the number, fits small screens)
    const shortId = wallet?.accountId.split(".").pop() ?? "";
    const fullId = wallet ? wallet.accountId.slice(0, 13) + "…" : "";

    return (
        <>
            <style>{css}</style>
            <header className="tb">
                {/* Logo */}
                <div className="tb-logo">
                    <div className="tb-logo-dot" />
                    OrderbookDex
                </div>

                {/* Nav tabs */}
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

                {/* Right side */}
                <div className="tb-right">
                    {/* Price ticker (tablet+) */}
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

                    {/* Network badge (desktop+) */}
                    <div className="tb-net">
                        <div className="tb-net-dot" />
                        <span>Testnet</span>
                    </div>

                    {/* Wallet button */}
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
                </div>
            </header>
        </>
    );
}
