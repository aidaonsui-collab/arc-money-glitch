import { create } from "zustand";

export type WalletId = "metamask" | "rabby" | "injected";

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isRabby?: boolean;
  providers?: Eip1193Provider[];
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const WALLETS: {
  id: WalletId;
  name: string;
  install: string;
}[] = [
  { id: "metamask", name: "MetaMask", install: "https://metamask.io/download" },
  { id: "rabby", name: "Rabby", install: "https://rabby.io" },
];

const STORAGE_KEY = "amg.wallet";

type Persisted = { address: string; walletId: WalletId };

function readPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed.address || !parsed.walletId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(data: Persisted | null) {
  if (typeof window === "undefined") return;
  try {
    if (data) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function allInjected(): Eip1193Provider[] {
  if (typeof window === "undefined") return [];
  const eth = window.ethereum;
  if (!eth) return [];
  if (Array.isArray(eth.providers) && eth.providers.length) return eth.providers;
  return [eth];
}

export function findProvider(id: WalletId): Eip1193Provider | null {
  const list = allInjected();
  if (id === "rabby") return list.find((p) => p.isRabby) ?? null;
  if (id === "metamask") {
    return (
      list.find((p) => p.isMetaMask && !p.isRabby) ??
      list.find((p) => p.isMetaMask) ??
      null
    );
  }
  return list[0] ?? null;
}

export function isWalletInstalled(id: WalletId): boolean {
  return Boolean(findProvider(id));
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function chainLabel(chainId: number | null): string {
  if (chainId == null) return "—";
  const names: Record<number, string> = {
    1: "Ethereum",
    10: "Optimism",
    56: "BNB",
    137: "Polygon",
    8453: "Base",
    42161: "Arbitrum",
    43114: "Avalanche",
    5042: "Arc",
    5042002: "Arc Testnet",
  };
  return names[chainId] ?? `Chain ${chainId}`;
}

export function getActiveProvider(): Eip1193Provider | null {
  if (activeProvider) return activeProvider;
  const id = useWallet.getState().walletId;
  if (id) return findProvider(id);
  return findProvider("injected");
}

export async function switchToArc(): Promise<void> {
  const provider = getActiveProvider();
  if (!provider) throw new Error("Connect a wallet first.");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13b2" }],
    });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? Number((err as { code: number }).code)
        : 0;
    if (code !== 4902) throw err instanceof Error ? err : new Error("Switch failed.");
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x13b2",
          chainName: "Arc",
          nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
          rpcUrls: ["https://arc-mainnet-rpc.baracat.meme"],
          blockExplorerUrls: ["https://arc-scan.io"],
        },
      ],
    });
  }
}

export async function watchAmgToken(token: string, symbol = "AMG", decimals = 6) {
  const provider = getActiveProvider();
  if (!provider) throw new Error("Connect a wallet first.");
  await provider.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: { address: token, symbol, decimals },
    } as unknown as unknown[],
  });
}

type WalletState = {
  address: string | null;
  chainId: number | null;
  walletId: WalletId | null;
  connecting: boolean;
  error: string | null;
  modalOpen: boolean;
  ready: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: (id: WalletId) => Promise<void>;
  disconnect: () => void;
  hydrate: () => Promise<void>;
};

let activeProvider: Eip1193Provider | null = null;
let bound = false;

function parseChainId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = value.startsWith("0x") ? parseInt(value, 16) : Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export const useWallet = create<WalletState>((set, get) => {
  const onAccounts = (...args: unknown[]) => {
    const accounts = args[0];
    if (!Array.isArray(accounts) || accounts.length === 0) {
      get().disconnect();
      return;
    }
    const address = String(accounts[0]);
    const walletId = get().walletId;
    set({ address, error: null });
    if (walletId) writePersisted({ address, walletId });
  };

  const onChain = (...args: unknown[]) => {
    set({ chainId: parseChainId(args[0]) });
  };

  const bind = (provider: Eip1193Provider) => {
    unbind();
    activeProvider = provider;
    provider.on?.("accountsChanged", onAccounts);
    provider.on?.("chainChanged", onChain);
    provider.on?.("disconnect", () => get().disconnect());
    bound = true;
  };

  const unbind = () => {
    if (!activeProvider || !bound) return;
    activeProvider.removeListener?.("accountsChanged", onAccounts);
    activeProvider.removeListener?.("chainChanged", onChain);
    bound = false;
    activeProvider = null;
  };

  return {
    address: null,
    chainId: null,
    walletId: null,
    connecting: false,
    error: null,
    modalOpen: false,
    ready: false,
    openModal: () => set({ modalOpen: true, error: null }),
    closeModal: () => set({ modalOpen: false }),
    disconnect: () => {
      unbind();
      writePersisted(null);
      set({
        address: null,
        chainId: null,
        walletId: null,
        connecting: false,
        error: null,
        modalOpen: false,
      });
    },
    hydrate: async () => {
      const saved = readPersisted();
      if (!saved) {
        set({ ready: true });
        return;
      }
      const provider = findProvider(saved.walletId);
      if (!provider) {
        writePersisted(null);
        set({ ready: true });
        return;
      }
      try {
        const accounts = (await provider.request({
          method: "eth_accounts",
        })) as string[];
        if (!accounts[0]) {
          writePersisted(null);
          set({ ready: true });
          return;
        }
        const chainRaw = await provider.request({ method: "eth_chainId" });
        bind(provider);
        set({
          address: accounts[0],
          chainId: parseChainId(chainRaw),
          walletId: saved.walletId,
          ready: true,
        });
      } catch {
        set({ ready: true });
      }
    },
    connect: async (id) => {
      const provider = findProvider(id);
      if (!provider) {
        set({
          error: `${id === "rabby" ? "Rabby" : "MetaMask"} is not installed.`,
        });
        return;
      }
      set({ connecting: true, error: null, walletId: id });
      try {
        const accounts = (await provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        const address = accounts[0];
        if (!address) throw new Error("No account returned.");
        const chainRaw = await provider.request({ method: "eth_chainId" });
        bind(provider);
        writePersisted({ address, walletId: id });
        set({
          address,
          chainId: parseChainId(chainRaw),
          walletId: id,
          connecting: false,
          modalOpen: false,
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Connection was rejected.";
        set({ connecting: false, error: msg });
      }
    },
  };
});
