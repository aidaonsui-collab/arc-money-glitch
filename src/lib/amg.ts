import type { Address } from "viem";
import { ARCFUN_URL, arcfunTokenUrl, parseAddress } from "./arc";

function env(name: string): string {
  if (typeof process === "undefined") return "";
  return (process.env[name] ?? "").trim();
}

/** Instant Reflection $AMG contract. Empty until launch. */
export function getAmgToken(): Address | null {
  return parseAddress(env("AMG_TOKEN_ADDRESS") || env("VITE_AMG_TOKEN_ADDRESS"));
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
