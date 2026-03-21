import { useState, useEffect } from "react";
import type { Trade, HCSMessage } from "../types";

const BASE_PRICE = 0.2845;
const HCS_TOPIC = "0.0.4829301";

function genId() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function mockTrade(mid: number): Trade {
    return {
        id: genId(),
        price: +(mid + (Math.random() - 0.5) * 0.008).toFixed(4),
        amount: +(Math.random() * 800 + 50).toFixed(2),
        side: Math.random() > 0.5 ? "buy" : "sell",
        buyerAccountId: "0.0.1234",
        sellerAccountId: "0.0.5678",
        hcsTxId: `${HCS_TOPIC}@${Math.floor(Date.now() / 1000)}`,
        executedAt: new Date()
    };
}

function mockHCSMessage(seqNo: number, mid: number): HCSMessage {
    const types: HCSMessage["type"][] = [
        "ORDER_PLACED",
        "TRADE_MATCHED",
        "SETTLEMENT_ATOMIC"
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const data =
        type === "ORDER_PLACED"
            ? {
                  side: Math.random() > 0.5 ? "buy" : "sell",
                  price: mid,
                  amount: +(Math.random() * 500 + 100).toFixed(2)
              }
            : type === "TRADE_MATCHED"
              ? {
                    price: mid,
                    amount: +(Math.random() * 300 + 50).toFixed(2),
                    buyer: "0.0.1234",
                    seller: "0.0.5678"
                }
              : {
                    txId: `${HCS_TOPIC}@${Math.floor(Date.now() / 1000)}`,
                    status: "SUCCESS"
                };
    return {
        id: genId(),
        seqNo,
        topicId: HCS_TOPIC,
        type,
        data,
        consensusTimestamp: new Date().toISOString()
    };
}

function seedTrades(count = 20): Trade[] {
    return Array.from({ length: count }, (_, i) => ({
        id: genId(),
        price: +(BASE_PRICE + (Math.random() - 0.5) * 0.01).toFixed(4),
        amount: +(Math.random() * 800 + 50).toFixed(2),
        side: (Math.random() > 0.5 ? "buy" : "sell") as "buy" | "sell",
        buyerAccountId: "0.0.1234",
        sellerAccountId: "0.0.5678",
        hcsTxId: `${HCS_TOPIC}@${Math.floor(Date.now() / 1000) - i * 18}`,
        executedAt: new Date(Date.now() - i * 18_000)
    }));
}

function seedHCS(count = 12): HCSMessage[] {
    return Array.from({ length: count }, (_, i) =>
        mockHCSMessage(count - i, BASE_PRICE)
    );
}

export function useTrades(midPrice: number) {
    const [trades, setTrades] = useState<Trade[]>(seedTrades);
    const [hcsMessages, setHcsMessages] = useState<HCSMessage[]>(seedHCS);

    useEffect(() => {
        const id = setInterval(() => {
            setTrades(prev => [mockTrade(midPrice), ...prev].slice(0, 30));
        }, 3000);
        return () => clearInterval(id);
    }, [midPrice]);

    useEffect(() => {
        const id = setInterval(() => {
            setHcsMessages(prev => {
                const next = mockHCSMessage(prev[0].seqNo + 1, midPrice);
                return [next, ...prev].slice(0, 25);
            });
        }, 5000);
        return () => clearInterval(id);
    }, [midPrice]);

    function pushOrder(order: {
        side: string;
        price: number;
        amount: number;
        hcsSeqNo: number;
    }) {
        const msg: HCSMessage = {
            id: genId(),
            seqNo: order.hcsSeqNo,
            topicId: HCS_TOPIC,
            type: "ORDER_PLACED",
            data: {
                side: order.side,
                price: order.price,
                amount: order.amount
            },
            consensusTimestamp: new Date().toISOString()
        };
        setHcsMessages(prev => [msg, ...prev].slice(0, 25));
    }

    return { trades, hcsMessages, pushOrder };
}
