// Lightweight WalletConnect v2 integration for Hedera.
// Uses @walletconnect/sign-client directly — no heavy UI framework.
// Supports HashPack, Blade, Kabila (any Hedera WalletConnect wallet).

// WalletConnect + Hedera nonce authentication.
//
// Flow:
// 1. Open WalletConnect QR modal
// 2. User approves in HashPack / MetaMask
// 3. POST /users/create-nonce  → get nonce
// 4. Ask wallet to sign message containing nonce
// 5. POST /users/verify-signature → get JWT
// 6. Store JWT, return accountId
import SignClient from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { createNonce, verifySignature, setJWT } from "./api";

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";
const HEDERA_TESTNET = "hedera:testnet";

const APP_METADATA = {
  name: "OrderbookDex",
  description: "Fair Orderbook DEX on Hedera — anti-front-running via HCS",
  url: typeof window !== "undefined" ? window.location.origin : "",
  icons: ["https://avatars.githubusercontent.com/u/31002956"],
};

let _client: SignClient | null = null;
let _modal: WalletConnectModal | null = null;

export async function getSignClient(): Promise<SignClient> {
  if (!_client) {
    _client = await SignClient.init({
      projectId: PROJECT_ID,
      metadata: APP_METADATA,
    });
  }
  return _client;
}

export function getModal(): WalletConnectModal {
  if (!_modal) {
    _modal = new WalletConnectModal({
      projectId: PROJECT_ID,
      chains: [HEDERA_TESTNET],
      themeMode: "dark",
      themeVariables: {
        "--wcm-background-color": "#0D0F18",
        "--wcm-accent-color": "#00BCD4",
      },
    });
  }
  return _modal;
}

async function clearStaleSessions(): Promise<void> {
    try {
        // Clear WalletConnect keys from localStorage
        Object.keys(localStorage)
            .filter(
                k =>
                    k.startsWith("wc@") ||
                    k.startsWith("walletconnect") ||
                    k.startsWith("W3M") ||
                    k.startsWith("WCM")
            )
            .forEach(k => localStorage.removeItem(k));

        // Reset singletons so fresh client is created
        _client = null;
        _modal = null;
    } catch {}
}

export async function connectWalletConnect(): Promise<string> {
<<<<<<< HEAD
  const client = await getSignClient();
  console.log("all sessions:", client.session.getAll());
  const modal = getModal();

  // Create a new pairing session
  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      hedera: {
        methods: [
          "hedera_signMessage",
          "hedera_signAndExecuteTransaction",
          "hedera_executeTransaction",
        ],
        chains: [HEDERA_TESTNET],
        events: ["accountsChanged", "chainChanged"],
      },
    },
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

  const topic = session.topic;
  // many Hedera WalletConnect wrappers expect the param shape:
  const { signatureMap: signature } = (await (
    await getSignClient()
  ).request({
    topic,
    chainId: "hedera:testnet", // some clients require chainId; harmless if ignored
    request: {
      method: "hedera_signMessage",
      params: {
        signerAccountId: accounts[0],
        message: `Account Verification! We want to perform verification checks for your account. Nonce: 787e79b2329efb5eadf09e72a88b10b1`,
      },
    },
  })) as { signatureMap: string };

  console.log(signature);

  const accountId = accounts[0].split(":")[2];
  return accountId;
=======
    // Clear stale sessions first
    Object.keys(localStorage)
        .filter(
            k =>
                k.startsWith("wc@") ||
                k.startsWith("walletconnect") ||
                k.startsWith("W3M") ||
                k.startsWith("WCM")
        )
        .forEach(k => localStorage.removeItem(k));

    _client = null;
    _modal = null;

    const client = await getSignClient();
    const modal = getModal();

    // ── Step 1: WalletConnect session ────────────────────────
    const { uri, approval } = await client.connect({
        optionalNamespaces: {
            hedera: {
                methods: [
                    "hedera_signMessage",
                    "hedera_signAndExecuteTransaction",
                    "hedera_executeTransaction"
                ],
                chains: [HEDERA_TESTNET],
                events: ["accountsChanged", "chainChanged"]
            }
        }
    });

    if (uri) await modal.openModal({ uri });

    const session = await approval();
    modal.closeModal();

    const accounts = session.namespaces?.hedera?.accounts ?? [];
    if (accounts.length === 0)
        throw new Error("No Hedera accounts returned from wallet");

    const signerAccountId = accounts[0];
    const accountId = signerAccountId.split(":")[2];
    const topic = session.topic;

    console.log("✅ Session established:", accountId);

    // ── Steps 2-4: Nonce → Sign → Verify in one tight loop ───
    // Retry up to 3 times in case the nonce expires between
    // steps due to mobile focus/timing issues.
    let lastError = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`🔑 Attempt ${attempt}: Getting nonce...`);
            const { nonce } = await createNonce(accountId);
            console.log("🔑 Nonce:", nonce);

            const message =
                `Account Verification! We want to perform verification checks ` +
                `for your account. Nonce: ${nonce}`;

            console.log("✍️ Requesting signature...");
            const signResult = await client.request({
                topic,
                chainId: HEDERA_TESTNET,
                request: {
                    method: "hedera_signMessage",
                    params: { signerAccountId, message }
                }
            });

            console.log("✍️ Sign result:", JSON.stringify(signResult, null, 2));

            // Extract signature
            let signature = "";
            if (typeof signResult === "string") {
                signature = signResult;
            } else if (signResult && typeof signResult === "object") {
                const r = signResult as Record<string, unknown>;
                if (typeof r.signatureMap === "string")
                    signature = r.signatureMap;
                else if (typeof r.signature === "string")
                    signature = r.signature;
                else {
                    const first = Object.values(r).find(
                        v => typeof v === "string"
                    );
                    if (first) signature = first as string;
                }
            }

            if (!signature) throw new Error("No signature returned");

            console.log("📡 Verifying signature...");
            const res = await verifySignature({
                signature,
                message,
                nonce,
                accountId
            });

            setJWT(res.token);
            console.log("✅ Auth complete! JWT stored.");
            return accountId;
        } catch (e) {
            lastError = (e as Error).message;
            console.warn(`⚠️ Attempt ${attempt} failed:`, lastError);

            if (attempt < 3) {
                console.log("🔄 Retrying in 1s...");
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    throw new Error(`Authentication failed after 3 attempts: ${lastError}`);
>>>>>>> 020d664 (Nonce refresh)
}
export async function disconnectAll(): Promise<void> {
<<<<<<< HEAD
  try {
    const client = await getSignClient();
    const sessions = client.session.getAll();
    await Promise.all(
      sessions.map((s: { topic: string }) =>
        client.disconnect({
          topic: s.topic,
          reason: { code: 6000, message: "User disconnected" },
        }),
      ),
    );
  } catch {
    // ignore
  }
=======
    try {
        if (!_client) return;
        const sessions = _client.session.getAll();
        await Promise.all(
            sessions.map(s =>
                _client!.disconnect({
                    topic: s.topic,
                    reason: { code: 6000, message: "User disconnected" }
                })
            )
        );
    } catch {
        // ignore
    }
    _client = null;
    _modal = null;
>>>>>>> 020d664 (Nonce refresh)
}

export async function getExistingAccountId(): Promise<string | null> {
  try {
    const client = await getSignClient();
    const sessions = client.session.getAll();
    if (sessions.length === 0) return null;

<<<<<<< HEAD
    const accounts = sessions[0].namespaces.hedera?.accounts ?? [];
    if (accounts.length === 0) return null;
=======
        const accounts = sessions[0].namespaces?.hedera?.accounts ?? [];
        if (accounts.length === 0) return null;
>>>>>>> 020d664 (Nonce refresh)

    return accounts[0].split(":")[2];
  } catch {
    return null;
  }
}
