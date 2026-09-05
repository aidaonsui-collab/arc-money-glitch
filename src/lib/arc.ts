import { defineChain, isAddress, type Address } from "viem";

export const ARC_CHAIN_ID = 5042;
export const ARC_CHAIN_HEX = "0x13b2";
export const ARC_EXPLORER = "https://arc-scan.io";
export const ARCFUN_URL = "https://arcfun.co";

export const ARC_USDC =
  "0x3600000000000000000000000000000000000000" as Address;

const BANNED_RPC_HOSTS = ["rpc.thirdweb.com"];

function env(name: string): string {
  if (typeof process === "undefined") return "";
  return (process.env[name] ?? "").trim();
}

function isBanned(url: string): boolean {
  return BANNED_RPC_HOSTS.some((h) => url.includes(h));
}

const INFURA_KEY =
  env("VITE_INFURA_API_KEY") ||
  env("VITE_INFURA_KEY") ||
  env("VITE_ARC_INFURA_KEY") ||
  env("INFURA_API_KEY") ||
  "";

const INFURA_RPC = INFURA_KEY
  ? `https://arc-mainnet.infura.io/v3/${INFURA_KEY}`
  : "";

const BARACAT = "https://arc-mainnet-rpc.baracat.meme";
const THELEAK = "https://ac-rpc.theleak.cx";
const ARCSCAN = "https://rpc.arc-scan.org";

export const ARC_RPC_URLS: string[] = (() => {
  // arc-scan first. Confirmed live 2026-09-05: this was the actual cause of /api/rewards
  // returning "—" (empty) on the home page — theleak was answering plain eth_chainId calls with
  // a malformed-looking "client packet length exceeds 255 buffer" 409, baracat was 502ing, and
  // this list had neither arc-scan (healthy) nor any other working endpoint to fall through to.
  // The site didn't hang forever, but the fallback chain exhausting both dead options took long
  // enough that the dashboard's fetch effectively never resolved in the user's session.
  const primary = env("ARC_RPC") || env("VITE_ARC_RPC") || ARCSCAN;
  const extras = (env("VITE_ARC_RPC_FALLBACKS") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [primary, ...extras, ARCSCAN, THELEAK, BARACAT, INFURA_RPC]) {
    if (!u || isBanned(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
})();

export const ARC_RPC = ARC_RPC_URLS[0] ?? BARACAT;

export const arcChain = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC] } },
  blockExplorers: {
    default: { name: "ArcScan", url: ARC_EXPLORER },
  },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});

export function isArcChain(chainId: number | null | undefined): boolean {
  return chainId === ARC_CHAIN_ID;
}

export function explorerAddressUrl(address: string): string {
  return `${ARC_EXPLORER}/address/${address}`;
}

export function arcfunTokenUrl(address: string): string {
  return `${ARCFUN_URL}/token/${address}`;
}

export function parseAddress(raw: string | undefined | null): Address | null {
  const v = (raw ?? "").trim();
  if (!v || !isAddress(v)) return null;
  return v as Address;
}
