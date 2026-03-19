export type WalletType = "hashconnect" | "metamask" | "demo";

export interface WalletState {
  accountId: string;
  walletType: WalletType;
  connected: boolean;
  balances: TokenBalance[];
}

export interface TokenBalance {
  symbol: string; // "HBAR" | "TOKA" | "TOKB"
  tokenId: string | null; // null for native HBAR
  amount: number;
}

// ─── ORDERS ──────────────────────────────────────────────
export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface Order {
  id: string;
  accountId: string;
  side: OrderSide;
  type: OrderType;
  price: number; // HBAR per TOKA
  amount: number; // TOKA quantity
  filled: number; // how much matched so far
  status: OrderStatus;
  hcsSeqNo?: number; // sequence number on HCS after submit
  hcsTxId?: string; // HCS consensus timestamp
  createdAt: Date;
}

// ─── ORDERBOOK ───────────────────────────────────────────
export interface OrderbookLevel {
  price: number;
  amount: number;
  total: number;
  depth: number; // 0–1, drives depth bar width
  orderCount: number;
}

export interface Orderbook {
  asks: OrderbookLevel[]; // sorted ascending  (lowest ask first)
  bids: OrderbookLevel[]; // sorted descending (highest bid first)
  spread: number;
  midPrice: number;
  lastUpdated: Date;
}

// ─── TRADES ──────────────────────────────────────────────
export interface Trade {
  id: string;
  price: number;
  amount: number;
  side: OrderSide;
  buyerAccountId: string;
  sellerAccountId: string;
  hcsTxId: string;
  executedAt: Date;
}

// ─── HCS MESSAGES ──────────────────────────────────────────────
export type HCSMessageType =
  | "ORDER_PLACED"
  | "ORDER_CANCELLED"
  | "TRADE_MATCHED"
  | "SETTLEMENT_ATOMIC"
  | "TOKEN_MINTED";

export interface HCSMessage {
  id: string;
  seqNo: number;
  topicId: string;
  type: HCSMessageType;
  data: Record<string, unknown>;
  consensusTimestamp: string;
}

// ─── TOAST ───────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  msg: string;
}
