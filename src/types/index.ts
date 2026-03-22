export type WalletType = "hashconnect" | "metamask" | "demo";

export interface WalletState {
  accountId:  string;
  walletType: WalletType;
  connected:  boolean;
  balances:   TokenBalance[];
}

export interface TokenBalance {
  symbol:  string;
  tokenId: string | null;
  amount:  number;
}

export type OrderSide   = "buy" | "sell";
export type OrderType   = "limit" | "market";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface Order {
  id:        string;
  accountId: string;
  side:      OrderSide;
  type:      OrderType;
  price:     number;
  amount:    number;
  filled:    number;
  status:    OrderStatus;
  hcsSeqNo?: number;
  hcsTxId?:  string;
  createdAt: Date;
}

export interface OrderbookLevel {
  price:      number;
  amount:     number;
  total:      number;
  depth:      number;
  orderCount: number;
}

export interface Orderbook {
  asks:        OrderbookLevel[];
  bids:        OrderbookLevel[];
  spread:      number;
  midPrice:    number;
  lastUpdated: Date;
}

export interface Trade {
  id:               string;
  price:            number;
  amount:           number;
  side:             OrderSide;
  buyerAccountId:   string;
  sellerAccountId:  string;
  hcsTxId:          string;
  executedAt:       Date;
}

export type HCSMessageType =
  | "ORDER_PLACED"
  | "ORDER_CANCELLED"
  | "TRADE_MATCHED"
  | "SETTLEMENT_ATOMIC"
  | "TOKEN_MINTED";

export interface HCSMessage {
  id:                 string;
  seqNo:              number;
  topicId:            string;
  type:               HCSMessageType;
  data:               Record<string, unknown>;
  consensusTimestamp: string;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id:    number;
  type:  ToastType;
  title: string;
  msg:   string;
}
