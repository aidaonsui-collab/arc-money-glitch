import { createFileRoute } from "@tanstack/react-router";
import { fetchGlobalRewards } from "@/lib/rewards.server";

export const Route = createFileRoute("/api/rewards/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await fetchGlobalRewards();
          return Response.json(data, {
            headers: {
              "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
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
