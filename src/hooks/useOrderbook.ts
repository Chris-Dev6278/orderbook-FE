// Generates a live-updating mock orderbook.
// When your backend is ready, replace generateMock()
// with a real fetch() call to GET /orderbook?pair=TOKA-HBAR

import { useState, useEffect, useRef } from "react";
import type { Orderbook } from "../types";

const BASE_PRICE = 0.2845;

// asks or bid
function buildSide(mid: number, direction: "ask" | "bid", levels = 12) {
    return Array.from({ length: levels }, (_, i) => {
        const spread =
            direction === "ask" ? 1 + (i + 1) * 0.00025 : 1 - (i + 1) * 0.00025;
        const price = +(mid * spread).toFixed(4);
        const amount = +(Math.random() * 1400 + 100).toFixed(2);
        const total = +(price * amount).toFixed(2);
        const depth = Math.random();
        return {
            price,
            amount,
            total,
            depth,
            orderCount: Math.ceil(Math.random() * 5)
        };
    }).sort((a, b) =>
        direction === "ask" ? a.price - b.price : b.price - a.price
    );
}

function generateMock(mid: number) {
    const asks = buildSide(mid, "ask");
    const bids = buildSide(mid, "bid");
    return {
        asks,
        bids,
        midPrice: +mid.toFixed(4),
        spread: +(asks[0].price - bids[0].price).toFixed(4),
        lastUpdated: new Date()
    };
}

export function useOrderbook() {
    const [orderbook, setOrderbook] = useState<Orderbook>(() =>
        generateMock(BASE_PRICE)
    );
    const [midPrice, setMidPrice] = useState(BASE_PRICE);
    const [priceUp, setPriceUp] = useState(true);
    const prevPrice = useRef(BASE_PRICE);

    useEffect(() => {
        const id = setInterval(() => {
            const delta = (Math.random() - 0.48) * 0.0004;
            const next = +(prevPrice.current + delta).toFixed(4);

            setPriceUp(next >= prevPrice.current);
            prevPrice.current = next;
            setMidPrice(next);
            setOrderbook(generateMock(next));
        }, 1500);
        return () => clearInterval(id);
    }, []);

    return { orderbook, midPrice, priceUp };
}
