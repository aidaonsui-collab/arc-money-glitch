import { createFileRoute } from "@tanstack/react-router";
import { isAddress } from "viem";
import { fetchWalletRewards } from "@/lib/rewards.server";

export const Route = createFileRoute("/api/rewards/$address")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const address = params.address;
        if (!isAddress(address)) {
          return Response.json({ error: "invalid address" }, { status: 400 });
        }
        try {
          const data = await fetchWalletRewards(address);
          return Response.json(data, {
            headers: {
              "Cache-Control": "public, s-maxage=8, stale-while-revalidate=20",
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "rewards failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
