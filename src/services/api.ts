// All API calls. Attaches JWT automatically when available.

export const BASE = "https://orderbook-be.onrender.com/api/v1";

// ── JWT storage ───────────────────────────────────────────
export function getJWT(): string | null {
    return localStorage.getItem("odx_jwt");
}
export function setJWT(token: string) {
    localStorage.setItem("odx_jwt", token);
}
export function clearJWT() {
    localStorage.removeItem("odx_jwt");
    localStorage.removeItem("odx_auth_pending");
}
export function isJWTExpired(): boolean {
    // Allow pending auth
    if (localStorage.getItem("odx_auth_pending")) return false;
    const token = getJWT();
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

// ── Base fetch ────────────────────────────────────────────
async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    auth = false
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (auth) {
        const jwt = getJWT();
        if (!jwt || isJWTExpired()) throw new Error("JWT_EXPIRED");
        headers["Authorization"] = `Bearer ${jwt}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log("=== API ERROR RESPONSE ===", JSON.stringify(err, null, 2));
        throw new Error(
            (err as { message?: string }).message ?? `HTTP ${res.status}`
        );
    }
    return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────
export const createNonce = (accountId: string) =>
    request<{ nonce: string }>("POST", "/users/create-nonce", { accountId });

export const verifySignature = (payload: {
    signature: string;
    message: string;
    nonce: string;
    accountId: string;
}) => request<{ token: string }>("POST", "/users/verify-signature", payload);

// ── Orders (authenticated) ────────────────────────────────
export const placeOrder = (order: {
    side: string;
    type: string;
    tokenBuy: string;
    tokenSell: string;
    amount: number;
    price: number;
    accountId: string;
}) => request("POST", "/orders", order, true);

export const fetchOrderbook = (pair: string) =>
    request("GET", `/orderbook?pair=${pair}`, undefined, false);

export const fetchSellOrders = (pair: string) =>
    request("GET", `/orders?pair=${pair}&side=sell`, undefined, true);

export const fetchTrades = (pair: string) =>
    request("GET", `/trades?pair=${pair}&limit=25`, undefined, false);

export const fetchHCSMessages = () =>
    request(
        "GET",
        "/hcs/messages?topicId=0.0.4829301&limit=20",
        undefined,
        false
    );

export const fetchBalances = (accountId: string) =>
    request("GET", `/balances/${accountId}`, undefined, true);

export const mintTokens = (accountId: string, symbol: string, amount: number) =>
    request("POST", "/faucet/mint", { accountId, symbol, amount }, true);
