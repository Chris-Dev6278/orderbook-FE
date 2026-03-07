// Lightweight WalletConnect v2 integration for Hedera.
// Uses @walletconnect/sign-client directly — no heavy UI framework.
// Supports HashPack, Blade, Kabila (any Hedera WalletConnect wallet).

import SignClient from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

// Hedera testnet chain ID in CAIP-2 format
const HEDERA_TESTNET = "hedera:testnet";

const APP_METADATA = {
    name: "OrderbookDex",
    description: "Fair Orderbook DEX on Hedera — anti-front-running via HCS",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: ["https://avatars.githubusercontent.com/u/31002956"]
};

// Singletons
let _client: SignClient | null = null;
let _modal: WalletConnectModal | null = null;

// ── Get or create SignClient ──────────────────────────────
export async function getSignClient(): Promise<SignClient> {
    if (!_client) {
        _client = await SignClient.init({
            projectId: PROJECT_ID,
            metadata: APP_METADATA
        });
    }
    return _client;
}

// ── Get or create Modal ───────────────────────────────────
export function getModal(): WalletConnectModal {
    if (!_modal) {
        _modal = new WalletConnectModal({
            projectId: PROJECT_ID,
            chains: [HEDERA_TESTNET],
            themeMode: "dark",
            themeVariables: {
                "--wcm-background-color": "#0D0F18",
                "--wcm-accent-color": "#00BCD4"
            }
        });
    }
    return _modal;
}

// ── Connect — returns accountId e.g. "0.0.1234567" ────────
export async function connectWalletConnect(): Promise<string> {
    const client = await getSignClient();
    const modal = getModal();

    // Create a new pairing session
    const { uri, approval } = await client.connect({
        requiredNamespaces: {
            hedera: {
                methods: [
                    "hedera_signAndExecuteTransaction",
                    "hedera_executeTransaction"
                ],
                chains: [HEDERA_TESTNET],
                events: ["accountsChanged", "chainChanged"]
            }
        }
    });

    // Open the QR modal if a URI was returned
    if (uri) {
        await modal.openModal({ uri });
    }

    // Wait for user to approve in their wallet
    const session = await approval();
    modal.closeModal();

    // Extract account ID from session
    // Format: "hedera:testnet:0.0.1234567"
    const accounts = session.namespaces.hedera?.accounts ?? [];
    if (accounts.length === 0) throw new Error("No accounts in session");

    const accountId = accounts[0].split(":")[2];
    return accountId;
}

// ── Disconnect all sessions ───────────────────────────────
export async function disconnectAll(): Promise<void> {
    try {
        const client = await getSignClient();
        const sessions = client.session.getAll();
        await Promise.all(
            sessions.map(s =>
                client.disconnect({
                    topic: s.topic,
                    reason: { code: 6000, message: "User disconnected" }
                })
            )
        );
    } catch {
        // ignore
    }
}

// ── Restore existing session if one exists ────────────────
export async function getExistingAccountId(): Promise<string | null> {
    try {
        const client = await getSignClient();
        const sessions = client.session.getAll();
        if (sessions.length === 0) return null;

        const accounts = sessions[0].namespaces.hedera?.accounts ?? [];
        if (accounts.length === 0) return null;

        return accounts[0].split(":")[2];
    } catch {
        return null;
    }
}
