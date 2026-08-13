import { useGlobalRewards } from "@/lib/use-rewards";
import { formatUsdc } from "@/lib/format";

export function RewardsCounter() {
  const { data, loading } = useGlobalRewards();
  const total = data?.totalUsdcDistributed ?? 0;
  const display = loading && !data ? null : formatUsdc(total);

  return (
    <div className="mt-14 w-full max-w-3xl bg-transparent px-6 py-5 sm:px-8 sm:py-6">
      <p className="font-mono text-[0.8rem] font-medium tracking-[0.22em] text-fg uppercase">
        Total USDC rewards distributed
      </p>
      <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2.5 font-display text-[clamp(1.85rem,5vw,2.75rem)] leading-none font-semibold tracking-tight tabular-nums text-fg text-glow">
        <span>{display ? `$${display}` : "—"}</span>
        <span className="font-sans text-sm font-medium tracking-normal text-muted sm:text-base">
          USDC
        </span>
      </p>
    </div>
  );
}
