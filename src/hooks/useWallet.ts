import { useState, useCallback, useEffect } from "react";
import type { WalletState, WalletType } from "../types";
import { addToast } from "./useToast";
import {
  connectWalletConnect,
  disconnectAll,
  getExistingAccountId,
} from "../services/walletConnect";
import { clearJWT, isJWTExpired } from "../services/api";

function makeBalances() {
  return [
    { symbol: "HBAR", tokenId: null,          amount: 0 },
    { symbol: "TOKA", tokenId: "0.0.4100001", amount: 0 },
    { symbol: "TOKB", tokenId: "0.0.4100002", amount: 0 },
  ];
}

function demoBalances() {
  return [
    { symbol: "HBAR", tokenId: null,          amount: 1000 },
    { symbol: "TOKA", tokenId: "0.0.4100001", amount: 5000 },
    { symbol: "TOKB", tokenId: "0.0.4100002", amount: 5000 },
  ];
}

export function useWallet() {
  const [wallet,     setWallet]     = useState<WalletState | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore session on load — only if JWT is still valid
  useEffect(() => {
    if (isJWTExpired()) {
      clearJWT();
      return;
    }
    getExistingAccountId().then(accountId => {
      if (accountId) {
        setWallet({
          accountId,
          walletType: "hashconnect",
          connected:  true,
          balances:   makeBalances(),
        });
      }
    });
  }, []);

  // JWT expiry watcher — checks every 60s
  useEffect(() => {
    if (!wallet || wallet.walletType === "demo") return;
    const id = setInterval(() => {
      if (isJWTExpired()) {
        clearJWT();
        setWallet(null);
        addToast({
          type:  "error",
          title: "Session Expired",
          msg:   "Your session expired. Please reconnect your wallet.",
        });
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [wallet]);

  const connect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    try {
      if (type === "demo") {
        await new Promise(r => setTimeout(r, 500));
        setWallet({
          accountId:  "0.0.9999999",
          walletType: "demo",
          connected:  true,
          balances:   demoBalances(),
        });
        addToast({
          type:  "success",
          title: "Demo Wallet Connected",
          msg:   "0.0.9999999 on Hedera Testnet",
        });
        return;
      }

      const accountId = await connectWalletConnect();
      setWallet({
        accountId,
        walletType: type,
        connected:  true,
        balances:   makeBalances(),
      });
      addToast({
        type:  "success",
        title: "Wallet Verified ✓",
        msg:   `${accountId} authenticated on Hedera Testnet`,
      });
    } catch (e) {
      const msg = (e as Error).message ?? "";
      if (!msg.includes("closed") && !msg.includes("rejected")) {
        addToast({ type: "error", title: "Connection Failed", msg });
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectAll();
    clearJWT();
    setWallet(null);
    addToast({
      type:  "info",
      title: "Disconnected",
      msg:   "Wallet disconnected and session cleared.",
    });
  }, []);

  const updateBalance = useCallback((symbol: string, delta: number) => {
    setWallet(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        balances: prev.balances.map(b =>
          b.symbol === symbol
            ? { ...b, amount: +(b.amount + delta).toFixed(6) }
            : b,
        ),
      };
    });
  }, []);

  const getBalance = useCallback(
    (symbol: string): number =>
      wallet?.balances.find(b => b.symbol === symbol)?.amount ?? 0,
    [wallet],
  );

  return { wallet, connecting, connect, disconnect, updateBalance, getBalance };
}
