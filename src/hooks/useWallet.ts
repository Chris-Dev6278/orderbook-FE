import { useState, useCallback, useEffect } from "react";
import type { WalletState, WalletType } from "../types";
import { addToast } from "./useToast";
import {
  connectWalletConnect,
  disconnectAll,
  getExistingAccountId,
} from "../services/walletConnect";

function makeBalances() {
  return [
    { symbol: "HBAR", tokenId: null, amount: 0 },
    { symbol: "TOKA", tokenId: "0.0.4100001", amount: 0 },
    { symbol: "TOKB", tokenId: "0.0.4100002", amount: 0 },
  ];
}

function demoBalances() {
  return [
    { symbol: "HBAR", tokenId: null, amount: 1000 },
    { symbol: "TOKA", tokenId: "0.0.4100001", amount: 5000 },
    { symbol: "TOKB", tokenId: "0.0.4100002", amount: 5000 },
  ];
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [connecting, setConnecting] = useState(false);

  // ── Restore existing WalletConnect session on load ────────
  useEffect(() => {
    getExistingAccountId().then((accountId) => {
      if (accountId) {
        setWallet({
          accountId,
          walletType: "hashconnect",
          connected: true,
          balances: makeBalances(),
        });
      }
    });
  }, []);

  // ── Connect ───────────────────────────────────────────────
  const connect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    try {
      // Demo wallet — no real wallet needed
      if (type === "demo") {
        await new Promise((r) => setTimeout(r, 500));
        setWallet({
          accountId: "0.0.9999999",
          walletType: "demo",
          connected: true,
          balances: demoBalances(),
        });
        addToast({
          type: "success",
          title: "Demo Wallet Connected",
          msg: "0.0.9999999 on Hedera Testnet",
        });
        return;
      }

      // Real wallet — opens WalletConnect QR modal
      const accountId = await connectWalletConnect();
      setWallet({
        accountId,
        walletType: type,
        connected: true,
        balances: makeBalances(),
      });
      addToast({
        type: "success",
        title: "Wallet Connected",
        msg: `${accountId} on Hedera Testnet`,
      });
    } catch (e) {
      console.log(e);
      const msg = (e as Error).message ?? "";
      if (!msg.includes("closed") && !msg.includes("rejected")) {
        addToast({ type: "error", title: "Connection Failed", msg });
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  // ── Disconnect ────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    await disconnectAll();
    setWallet(null);
    addToast({
      type: "info",
      title: "Disconnected",
      msg: "Wallet disconnected.",
    });
  }, []);

  // ── Optimistic balance update ─────────────────────────────
  const updateBalance = useCallback((symbol: string, delta: number) => {
    setWallet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        balances: prev.balances.map((b) =>
          b.symbol === symbol
            ? { ...b, amount: +(b.amount + delta).toFixed(6) }
            : b,
        ),
      };
    });
  }, []);

  // ── Get balance by symbol ─────────────────────────────────
  const getBalance = useCallback(
    (symbol: string): number => {
      return wallet?.balances.find((b) => b.symbol === symbol)?.amount ?? 0;
    },
    [wallet],
  );

  return {
    wallet,
    connecting,
    connect,
    disconnect,
    updateBalance,
    getBalance,
  };
}
