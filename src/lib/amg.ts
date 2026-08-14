import type { Address } from "viem";
import { ARCFUN_URL, arcfunTokenUrl, parseAddress } from "./arc";

/** Instant Reflection $AMG on Arc mainnet (arcfun.co). Env can override. */
export const AMG_TOKEN_DEFAULT =
  "0x63c9A280E2756e5F190bf03d639c74b57bcDF85c" as Address;

function env(name: string): string {
  if (typeof process === "undefined") return "";
  return (process.env[name] ?? "").trim();
}

export function getAmgToken(): Address | null {
  return (
    parseAddress(env("AMG_TOKEN_ADDRESS") || env("VITE_AMG_TOKEN_ADDRESS")) ??
    AMG_TOKEN_DEFAULT
  );
}

export function isAmgLaunched(): boolean {
  return getAmgToken() !== null;
}

export function amgBuyUrl(): string {
  const custom = env("VITE_AMG_BUY_URL");
  if (custom) return custom;
  const token = getAmgToken();
  if (token) return arcfunTokenUrl(token);
  return ARCFUN_URL;
}

export const AMG_NAME = "Arc Money Glitch";
export const AMG_SYMBOL = "AMG";
