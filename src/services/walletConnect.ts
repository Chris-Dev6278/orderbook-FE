import SignClient from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { createNonce, verifySignature, setJWT } from "./api";

const PROJECT_ID     = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";
const HEDERA_TESTNET = "hedera:testnet";

const APP_METADATA = {
  name:        "OrderbookDex",
  description: "Fair Orderbook DEX on Hedera — anti-front-running via HCS",
  url:         typeof window !== "undefined" ? window.location.origin : "",
  icons:       ["https://avatars.githubusercontent.com/u/31002956"],
};

let _client: SignClient | null = null;
let _modal:  WalletConnectModal | null = null;

export async function getSignClient(): Promise<SignClient> {
  if (!_client) {
    _client = await SignClient.init({
      projectId: PROJECT_ID,
      metadata:  APP_METADATA,
    });
  }
  return _client;
}

export function getModal(): WalletConnectModal {
  if (!_modal) {
    _modal = new WalletConnectModal({
      projectId: PROJECT_ID,
      chains:    [HEDERA_TESTNET],
      themeMode: "dark",
      themeVariables: {
        "--wcm-background-color": "#0D0F18",
        "--wcm-accent-color":     "#00BCD4",
      },
    });
  }
  return _modal;
}

export async function connectWalletConnect(): Promise<string> {
  // Clear stale sessions
  Object.keys(localStorage)
    .filter(k =>
      k.startsWith("wc@") ||
      k.startsWith("walletconnect") ||
      k.startsWith("W3M") ||
      k.startsWith("WCM")
    )
    .forEach(k => localStorage.removeItem(k));
  _client = null;
  _modal  = null;

  const client = await getSignClient();
  const modal  = getModal();

  const { uri, approval } = await client.connect({
    optionalNamespaces: {
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

  if (uri) await modal.openModal({ uri });

  const session = await approval();
  modal.closeModal();

  const accounts = session.namespaces?.hedera?.accounts ?? [];
  if (accounts.length === 0)
    throw new Error("No Hedera accounts returned from wallet");

  const signerAccountId = accounts[0];
  const accountId       = signerAccountId.split(":")[2];
  const topic           = session.topic;

  console.log("✅ Session established:", accountId);

  // Retry loop — fresh nonce each attempt
  let lastError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔑 Attempt ${attempt}: Getting nonce...`);
      const { nonce } = await createNonce(accountId);
      console.log("🔑 Nonce:", nonce);

      const message =
        `Account Verification! We want to perform verification checks ` +
        `for your account. Nonce: ${nonce}`;

      console.log("✍️ Signing message...");
      const signResult = await client.request({
        topic,
        chainId: HEDERA_TESTNET,
        request: {
          method: "hedera_signMessage",
          params: { signerAccountId, message },
        },
      });

      console.log("✍️ Sign result:", JSON.stringify(signResult, null, 2));

      let signature = "";
      if (typeof signResult === "string") {
        signature = signResult;
      } else if (signResult && typeof signResult === "object") {
        const r = signResult as Record<string, unknown>;
        if      (typeof r.signatureMap === "string") signature = r.signatureMap;
        else if (typeof r.signature    === "string") signature = r.signature;
        else {
          const first = Object.values(r).find(v => typeof v === "string");
          if (first) signature = first as string;
        }
      }

      if (!signature) throw new Error("No signature returned from wallet");

      console.log("📡 Verifying...");
      const res = await verifySignature({ signature, message, nonce, accountId });
      setJWT(res.token);
      console.log("✅ Auth complete!");
      return accountId;

    } catch (e) {
      lastError = (e as Error).message;
      console.warn(`⚠️ Attempt ${attempt} failed:`, lastError);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(`Authentication failed after 3 attempts: ${lastError}`);
}

export async function disconnectAll(): Promise<void> {
  try {
    if (!_client) return;
    const sessions = _client.session.getAll();
    await Promise.all(
      sessions.map(s =>
        _client!.disconnect({
          topic:  s.topic,
          reason: { code: 6000, message: "User disconnected" },
        }),
      ),
    );
  } catch {
    // ignore
  }
  _client = null;
  _modal  = null;
}

export async function getExistingAccountId(): Promise<string | null> {
  try {
    const client   = await getSignClient();
    const sessions = client.session.getAll();
    if (sessions.length === 0) return null;

    const accounts = sessions[0].namespaces?.hedera?.accounts ?? [];
    if (accounts.length === 0) return null;

    return accounts[0].split(":")[2];
  } catch {
    return null;
  }
}
