import {
  createPublicClient,
  fallback,
  formatUnits,
  getAddress,
  http,
  isAddress,
  type Address,
  type PublicClient,
} from "viem";
import { AMG_REWARD_ABI, ERC20_META_ABI } from "./amg-abi";
import { amgBuyUrl, getAmgToken } from "./amg";
import {
  ARC_CHAIN_ID,
  ARC_RPC_URLS,
  ARC_USDC,
  arcChain,
} from "./arc";
import { getSql } from "./db";
import type { GlobalRewards, WalletRewards } from "./rewards-types";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function toHuman(raw: bigint, decimals: number): number {
  try {
    const n = Number(formatUnits(raw, decimals));
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function emptyGlobal(source: GlobalRewards["source"], error?: string): GlobalRewards {
  return {
    launched: false,
    token: null,
    symbol: "AMG",
    name: "Arc Money Glitch",
    buyUrl: amgBuyUrl(),
    chainId: ARC_CHAIN_ID,
    chainName: "Arc",
    totalUsdcDistributed: 0,
    totalUsdcWithdrawn: 0,
    rewardSymbol: "USDC",
    tokenDecimals: 6,
    rewardDecimals: 6,
    at: Date.now(),
    source,
    error,
  };
}

function emptyWallet(address: string, source: WalletRewards["source"], error?: string): WalletRewards {
  return {
    launched: false,
    token: null,
    address,
    symbol: "AMG",
    buyUrl: amgBuyUrl(),
    chainId: ARC_CHAIN_ID,
    amgRaw: "0",
    amgHeld: 0,
    earnedUsdc: 0,
    claimedUsdc: 0,
    claimableUsdc: 0,
    rewardSymbol: "USDC",
    at: Date.now(),
    source,
    error,
  };
}

let _client: PublicClient | null = null;

function arcClient(): PublicClient {
  if (_client) return _client;
  const urls = ARC_RPC_URLS.length ? ARC_RPC_URLS : ["https://arc-mainnet-rpc.baracat.meme"];
  _client = createPublicClient({
    chain: arcChain,
    transport:
      urls.length > 1
        ? fallback(
            urls.map((u) => http(u, { retryCount: 0, timeout: 4_000 })),
          )
        : http(urls[0], { timeout: 4_000 }),
  });
  return _client;
}

const mem = globalThis as typeof globalThis & {
  __amgGlobalCache__?: { at: number; data: GlobalRewards };
  __amgWalletCache__?: Map<string, { at: number; data: WalletRewards }>;
};

const GLOBAL_TTL_MS = 12_000;
const WALLET_TTL_MS = 10_000;

async function persistGlobal(data: GlobalRewards) {
  try {
    const sql = await getSql();
    await sql`
      insert into reward_snapshots (
        id, launched, token, total_usdc_distributed, total_usdc_withdrawn, updated_at
      ) values (
        ${"global"}, ${data.launched}, ${data.token}, ${data.totalUsdcDistributed},
        ${data.totalUsdcWithdrawn}, now()
      )
      on conflict (id) do update set
        launched = excluded.launched,
        token = excluded.token,
        total_usdc_distributed = excluded.total_usdc_distributed,
        total_usdc_withdrawn = excluded.total_usdc_withdrawn,
        updated_at = now()
    `;
  } catch {
    /* cache is best-effort */
  }
}

async function loadGlobalSnapshot(): Promise<GlobalRewards | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{
      launched: boolean;
      token: string | null;
      total_usdc_distributed: string | number;
      total_usdc_withdrawn: string | number;
      updated_at: string;
    }>`select launched, token, total_usdc_distributed, total_usdc_withdrawn, updated_at
       from reward_snapshots where id = ${"global"}`;
    const row = rows[0];
    if (!row) return null;
    return {
      ...emptyGlobal("cache"),
      launched: Boolean(row.launched && row.token),
      token: row.token,
      totalUsdcDistributed: Number(row.total_usdc_distributed) || 0,
      totalUsdcWithdrawn: Number(row.total_usdc_withdrawn) || 0,
      buyUrl: amgBuyUrl(),
    };
  } catch {
    return null;
  }
}

async function persistWallet(data: WalletRewards) {
  try {
    const sql = await getSql();
    await sql`
      insert into wallet_reward_cache (
        address, amg_raw, amg_human, earned_usdc, claimed_usdc, claimable_usdc, updated_at
      ) values (
        ${data.address.toLowerCase()}, ${data.amgRaw}, ${data.amgHeld},
        ${data.earnedUsdc}, ${data.claimedUsdc}, ${data.claimableUsdc}, now()
      )
      on conflict (address) do update set
        amg_raw = excluded.amg_raw,
        amg_human = excluded.amg_human,
        earned_usdc = excluded.earned_usdc,
        claimed_usdc = excluded.claimed_usdc,
        claimable_usdc = excluded.claimable_usdc,
        updated_at = now()
    `;
  } catch {
    /* cache is best-effort */
  }
}

async function loadWalletSnapshot(address: string): Promise<WalletRewards | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{
      amg_raw: string;
      amg_human: string | number;
      earned_usdc: string | number;
      claimed_usdc: string | number;
      claimable_usdc: string | number;
    }>`select amg_raw, amg_human, earned_usdc, claimed_usdc, claimable_usdc
       from wallet_reward_cache where address = ${address.toLowerCase()}`;
    const row = rows[0];
    if (!row) return null;
    const token = getAmgToken();
    return {
      ...emptyWallet(address, "cache"),
      launched: Boolean(token),
      token,
      amgRaw: row.amg_raw,
      amgHeld: Number(row.amg_human) || 0,
      earnedUsdc: Number(row.earned_usdc) || 0,
      claimedUsdc: Number(row.claimed_usdc) || 0,
      claimableUsdc: Number(row.claimable_usdc) || 0,
      buyUrl: amgBuyUrl(),
    };
  } catch {
    return null;
  }
}

export async function fetchGlobalRewards(): Promise<GlobalRewards> {
  const hit = mem.__amgGlobalCache__;
  if (hit && Date.now() - hit.at < GLOBAL_TTL_MS) return hit.data;

  const token = getAmgToken();
  if (!token) {
    const data = emptyGlobal("prelaunch");
    mem.__amgGlobalCache__ = { at: Date.now(), data };
    void persistGlobal(data);
    return data;
  }

  try {
    const client = arcClient();
    const [distributed, withdrawn, decimals, symbol, name, rewardToken] =
      await Promise.all([
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "totalRewardsDistributed",
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "totalRewardsWithdrawn",
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "decimals",
        }) as Promise<number>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "symbol",
        }) as Promise<string>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "name",
        }) as Promise<string>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "rewardToken",
        }) as Promise<Address>,
      ]);

    const [rewardDecimals, rewardSymbol] = await Promise.all([
      client
        .readContract({
          address: rewardToken,
          abi: ERC20_META_ABI,
          functionName: "decimals",
        })
        .then((d) => Number(d))
        .catch(() => 6),
      client
        .readContract({
          address: rewardToken,
          abi: ERC20_META_ABI,
          functionName: "symbol",
        })
        .catch(() => "USDC"),
    ]);

    const dec =
      Number.isFinite(rewardDecimals) && rewardDecimals > 0 ? rewardDecimals : 6;
    const data: GlobalRewards = {
      launched: true,
      token,
      symbol: symbol || "AMG",
      name: name || "Arc Money Glitch",
      buyUrl: amgBuyUrl(),
      chainId: ARC_CHAIN_ID,
      chainName: "Arc",
      totalUsdcDistributed: toHuman(distributed, dec),
      totalUsdcWithdrawn: toHuman(withdrawn, dec),
      rewardSymbol: rewardSymbol || "USDC",
      tokenDecimals: Number(decimals) || 6,
      rewardDecimals: dec,
      at: Date.now(),
      source: "chain",
    };
    mem.__amgGlobalCache__ = { at: Date.now(), data };
    void persistGlobal(data);
    return data;
  } catch (err) {
    const cached = await loadGlobalSnapshot();
    if (cached) {
      cached.error = err instanceof Error ? err.message : "rpc failed";
      mem.__amgGlobalCache__ = { at: Date.now(), data: cached };
      return cached;
    }
    const data = emptyGlobal(
      "prelaunch",
      err instanceof Error ? err.message : "rpc failed",
    );
    data.launched = true;
    data.token = token;
    return data;
  }
}

export async function fetchWalletRewards(rawAddress: string): Promise<WalletRewards> {
  if (!isAddress(rawAddress) || rawAddress.toLowerCase() === ZERO_ADDR) {
    throw new Error("invalid address");
  }
  const address = getAddress(rawAddress);

  mem.__amgWalletCache__ ??= new Map();
  const hit = mem.__amgWalletCache__.get(address.toLowerCase());
  if (hit && Date.now() - hit.at < WALLET_TTL_MS) return hit.data;

  const token = getAmgToken();
  if (!token) {
    const data = emptyWallet(address, "prelaunch");
    mem.__amgWalletCache__.set(address.toLowerCase(), { at: Date.now(), data });
    return data;
  }

  try {
    const client = arcClient();
    const [holding, earned, claimed, claimable, decimals, symbol, rewardToken] =
      await Promise.all([
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "balanceOf",
          args: [address],
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "accumulativeRewardOf",
          args: [address],
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "withdrawnRewards",
          args: [address],
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "withdrawableRewardOf",
          args: [address],
        }) as Promise<bigint>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "decimals",
        }) as Promise<number>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "symbol",
        }) as Promise<string>,
        client.readContract({
          address: token,
          abi: AMG_REWARD_ABI,
          functionName: "rewardToken",
        }) as Promise<Address>,
      ]);

    const rewardDecimals = await client
      .readContract({
        address: rewardToken,
        abi: ERC20_META_ABI,
        functionName: "decimals",
      })
      .then((d) => Number(d))
      .catch(() => 6);

    const tokenDec = Number(decimals) || 6;
    const rewDec =
      Number.isFinite(rewardDecimals) && rewardDecimals > 0 ? rewardDecimals : 6;
    const isUsdc = rewardToken.toLowerCase() === ARC_USDC.toLowerCase();

    const data: WalletRewards = {
      launched: true,
      token,
      address,
      symbol: symbol || "AMG",
      buyUrl: amgBuyUrl(),
      chainId: ARC_CHAIN_ID,
      amgRaw: holding.toString(),
      amgHeld: toHuman(holding, tokenDec),
      earnedUsdc: toHuman(earned, rewDec),
      claimedUsdc: toHuman(claimed, rewDec),
      claimableUsdc: toHuman(claimable, rewDec),
      rewardSymbol: isUsdc ? "USDC" : "USDC",
      at: Date.now(),
      source: "chain",
    };
    mem.__amgWalletCache__.set(address.toLowerCase(), { at: Date.now(), data });
    void persistWallet(data);
    return data;
  } catch (err) {
    const cached = await loadWalletSnapshot(address);
    if (cached) {
      cached.error = err instanceof Error ? err.message : "rpc failed";
      mem.__amgWalletCache__.set(address.toLowerCase(), {
        at: Date.now(),
        data: cached,
      });
      return cached;
    }
    const data = emptyWallet(
      address,
      "prelaunch",
      err instanceof Error ? err.message : "rpc failed",
    );
    data.launched = true;
    data.token = token;
    return data;
  }
}
