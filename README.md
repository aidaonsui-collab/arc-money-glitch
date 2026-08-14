# Arc Money Glitch ($AMG)

Reflection meme on **Arc** (chain `5042`). Live on [arcfun.co](https://arcfun.co/token/0x63c9A280E2756e5F190bf03d639c74b57bcDF85c). Hold `$AMG`, earn **USDC**.

Contract: [`0x63c9A280E2756e5F190bf03d639c74b57bcDF85c`](https://arc-scan.io/address/0x63c9A280E2756e5F190bf03d639c74b57bcDF85c)

The site is a TanStack Start app:

- **Home** — global USDC paid to every holder (`totalRewardsDistributed`)
- **Rewards dashboard** — connect an EVM wallet, switch to Arc, see `$AMG` held and lifetime USDC reflected to that address

## Backend

| Route | What it returns |
| --- | --- |
| `GET /api/rewards` | Global USDC distributed + withdrawn |
| `GET /api/rewards/:address` | Wallet `$AMG` balance, lifetime earned, claimed, claimable |

Reads the Instant Reflection ABI. Override the contract with `AMG_TOKEN_ADDRESS` / `VITE_AMG_TOKEN_ADDRESS` if you redeploy.

## Dev

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Stack

React 19 · TanStack Start · Tailwind v4 · viem · Arc mainnet
