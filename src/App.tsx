import { useState } from "react";
import { GlobalStyles } from "./lib/tokens";
import { Topbar } from "./components/Topbar";
import { WalletModal } from "./components/WalletModal";
import { Orderbook } from "./components/Orderbook";
import { OrderForm } from "./components/OrderForm";
import { TradeList } from "./components/TradeList";
import { HCSLog } from "./components/HCSLog";
import { ConfirmModal } from "./components/ConfirmModal";
import { useWallet } from "./hooks/useWallet";
import { useOrderbook } from "./hooks/useOrderbook";
import { useTrades } from "./hooks/useTrades";
import { useToasts, addToast } from "./hooks/useToast";
import type { OrderPayload } from "./components/OrderForm";
import { FaucetPage } from "./components/FaucetPage";
import { AdminPage } from "./components/AdminPage";

// ── Toast container ───────────────────────────────────────
function ToastContainer() {
  const toasts = useToasts();
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 16,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "11px 14px",
            borderRadius: "var(--radius)",
            border: "1px solid",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            animation: "slideRight 0.3s ease",
            ...(t.type === "success" && {
              background: "rgba(16,185,129,0.15)",
              borderColor: "rgba(16,185,129,0.4)",
              color: "var(--green)",
            }),
            ...(t.type === "error" && {
              background: "rgba(239,68,68,0.15)",
              borderColor: "rgba(239,68,68,0.4)",
              color: "var(--red)",
            }),
            ...(t.type === "info" && {
              background: "rgba(0,188,212,0.15)",
              borderColor: "rgba(0,188,212,0.4)",
              color: "var(--cyan)",
            }),
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 3,
            }}
          >
            {t.title}
          </div>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Balance bar ───────────────────────────────────────────
function BalanceBar({ getBalance }: { getBalance: (s: string) => number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "8px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg1)",
        flexShrink: 0,
        flexWrap: "wrap" as const,
      }}
    >
      {[
        { sym: "HBAR", color: "var(--cyan)" },
        { sym: "TOKA", color: "var(--purple)" },
        { sym: "TOKB", color: "var(--amber)" },
      ].map((b) => (
        <div
          key={b.sym}
          style={{
            display: "flex",
            flexDirection: "column" as const,
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.5px",
              textTransform: "uppercase" as const,
            }}
          >
            {b.sym}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: b.color,
              fontFamily: "var(--font-mono)",
            }}
          >
            {getBalance(b.sym).toFixed(2)}
          </span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
        {["HCS", "HTS", "Atomic"].map((tag, i) => (
          <span
            key={tag}
            style={{
              padding: "2px 7px",
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.5px",
              fontFamily: "var(--font-mono)",
              ...(i === 0 && {
                background: "var(--cyan-dim)",
                color: "var(--cyan)",
              }),
              ...(i === 1 && {
                background: "var(--purple-dim)",
                color: "var(--purple)",
              }),
              ...(i === 2 && {
                background: "var(--green-dim)",
                color: "var(--green)",
              }),
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────
type Page = "dex" | "faucet" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("dex");
  const [showWallet, setShowWallet] = useState(false);
  const [pendingOrder, setPending] = useState<OrderPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { wallet, connect, updateBalance, getBalance } = useWallet();
  const { orderbook, midPrice, priceUp } = useOrderbook();
  const { trades, hcsMessages, pushOrder } = useTrades(midPrice);

  // ── Order confirm flow ──────────────────────────────────
  async function handleConfirm() {
    if (!pendingOrder || !wallet) return;
    setSubmitting(true);

    // Simulate network delay (replace with real API call in Step 12)
    await new Promise((r) => setTimeout(r, 700));

    const seqNo = hcsMessages[0].seqNo + 1;

    // Optimistic balance update
    if (pendingOrder.side === "buy") {
      updateBalance("HBAR", -pendingOrder.total);
      updateBalance("TOKA", +pendingOrder.amount);
    } else {
      updateBalance("TOKA", -pendingOrder.amount);
      updateBalance("HBAR", +pendingOrder.total);
    }

    // Push to HCS log
    pushOrder({
      side: pendingOrder.side,
      price: pendingOrder.price,
      amount: pendingOrder.amount,
      hcsSeqNo: seqNo,
    });

    addToast({
      type: "success",
      title: "Order Placed",
      msg: `HCS seq #${seqNo} — ${pendingOrder.side.toUpperCase()} ${pendingOrder.amount} TOKA @ ${pendingOrder.price}`,
    });

    // Simulate a match notification after 2s
    setTimeout(() => {
      addToast({
        type: "info",
        title: "Order Matched!",
        msg: "Atomic settlement executing on Hedera Testnet.",
      });
    }, 2000);

    setSubmitting(false);
    setPending(null);
  }
  return (
    <>
      <GlobalStyles />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Topbar
          page={page}
          onNav={setPage}
          midPrice={midPrice}
          priceUp={priceUp}
          wallet={wallet}
          onWalletClick={() => setShowWallet(true)}
        />

        {/* ── DEX PAGE ── */}
        {page === "dex" && (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left — Orderbook */}
            <div
              style={{
                width: 240,
                flexShrink: 0,
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Orderbook orderbook={orderbook} loading={false} />
            </div>

            {/* Center — Balance bar + trades + HCS log */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {wallet && <BalanceBar getBalance={getBalance} />}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                {/* Trades */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <TradeList trades={trades} />
                </div>

                {/* HCS log */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <HCSLog messages={hcsMessages} />
                </div>
              </div>
            </div>

            {/* Right — Order form */}
            <div
              style={{
                width: 280,
                flexShrink: 0,
                borderLeft: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg1)",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-mid)",
                  letterSpacing: 1,
                  textTransform: "uppercase" as const,
                }}
              >
                Place Order
              </div>
              <OrderForm
                wallet={wallet}
                midPrice={midPrice}
                getBalance={getBalance}
                onSubmit={setPending}
              />
            </div>
          </div>
        )}

        {/* ── FAUCET PAGE ── */}
        {page === "faucet" && (
          <FaucetPage
            wallet={wallet}
            getBalance={getBalance}
            onMint={async (symbol, amount) => {
              // Simulate mint delay (replace with real API call later)
              await new Promise((r) => setTimeout(r, 800));
              updateBalance(symbol, amount);
              addToast({
                type: "success",
                title: "Tokens Minted",
                msg: `+${amount} ${symbol} added to ${wallet?.accountId}`,
              });
            }}
          />
        )}
        {/* ── ADMIN PAGE ── */}
        {page === "admin" && (
          <AdminPage
            trades={trades}
            hcsMessages={hcsMessages}
            wallet={wallet}
            getBalance={getBalance}
          />
        )}
      </div>

      {/* Modals */}
      {showWallet && (
        <WalletModal
          onConnect={(type) => {
            connect(type);
            setShowWallet(false);
          }}
          onClose={() => setShowWallet(false)}
        />
      )}
      {pendingOrder && (
        <ConfirmModal
          order={pendingOrder}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
          loading={submitting}
        />
      )}
      <ToastContainer />
    </>
  );
}
