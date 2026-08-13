# Arc Money Glitch ($AMG)

Reflection meme on **Arc** (chain `5042`). Launching on [arcfun.co](https://arcfun.co). Hold `$AMG`, earn **USDC**.

The site is a TanStack Start app:

- **Home** — global USDC paid to every holder (`totalRewardsDistributed` on the Instant Reflection contract)
- **Rewards dashboard** — connect any EIP-1193 EVM wallet (MetaMask / Rabby), switch to Arc, see `$AMG` held and lifetime USDC reflected to that address

The token is not live yet. Leave the contract env vars empty and both surfaces show `$0.00` plus a pre-launch state. Set the address after the arcfun Instant Reflection create and the same UI reads the chain.

## After launch

```bash
# .env.local
AMG_TOKEN_ADDRESS=0x...
VITE_AMG_TOKEN_ADDRESS=0x...
```

Optional: `VITE_AMG_BUY_URL` (defaults to `https://arcfun.co/token/<address>` once set).

Public Arc RPC is [baracat](https://arc-mainnet-rpc.baracat.meme). For production traffic, set `ARC_RPC` / `VITE_ARC_RPC` to an Infura Arc endpoint.

## Backend

| Route | What it returns |
| --- | --- |
| `GET /api/rewards` | Global USDC distributed + withdrawn |
| `GET /api/rewards/:address` | Wallet `$AMG` balance, lifetime earned, claimed, claimable |

Reads the Instant Reflection ABI (`totalRewardsDistributed`, `accumulativeRewardOf`, `balanceOf`, …). Snapshots are written to Postgres (Neon when `DATABASE_URL` is set, otherwise embedded PGLite) so a flaky RPC still serves the last good numbers.

## Dev

```bash
npm install
npm run dev      # http://localhost:8080
npm run typecheck
npm run build
```

## Stack

React 19 · TanStack Start · Tailwind v4 · viem · Arc mainnet
