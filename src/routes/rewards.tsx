import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CoinRain } from "@/components/coin-rain";
import { SiteNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/social";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/wallet/connect-button";
import { claimAmgRewards } from "@/lib/claim";
import { formatToken, formatUsdc } from "@/lib/format";
import { useWalletRewards } from "@/lib/use-rewards";
import { isArcChain, explorerAddressUrl } from "@/lib/arc";
import {
  chainLabel,
  shortenAddress,
  switchToArc,
  useWallet,
} from "@/lib/wallet";

export const Route = createFileRoute("/rewards")({ component: RewardsPage });

function RewardsPage() {
  const address = useWallet((s) => s.address);
  const chainId = useWallet((s) => s.chainId);
  const ready = useWallet((s) => s.ready);
  const openModal = useWallet((s) => s.openModal);
  const { data, error, loading } = useWalletRewards(address);
  const [claiming, setClaiming] = useState(false);
  const [switching, setSwitching] = useState(false);

  const onArc = isArcChain(chainId);
  const launched = data?.launched ?? false;
  const claimable = data?.claimableUsdc ?? 0;

  return (
    <div className="relative min-h-svh bg-bg text-fg">
      <CoinRain />
      <SiteNav />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.28em] text-primary uppercase">
          Rewards dashboard
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-[-0.03em]">
              Your Arc Money Glitch
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Connect an EVM wallet to see your $AMG bag and the USDC
              reflections paid to that address.
            </p>
          </div>
          {address ? (
            <p className="font-mono text-xs text-faint">
              {shortenAddress(address)} · {chainLabel(chainId)}
            </p>
          ) : null}
        </div>

        {!ready ? (
          <div className="mt-10 h-48 animate-pulse rounded-xl bg-surface" />
        ) : !address ? (
          <div className="mt-10 rounded-2xl bg-surface p-8 text-center shadow-[var(--shadow-border)]">
            <p className="font-display text-xl font-semibold">
              Connect to view rewards
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              MetaMask or Rabby. Rewards are keyed to the connected Arc
              address.
            </p>
            <div className="mt-6 flex justify-center">
              <ConnectButton size="lg" />
            </div>
          </div>
        ) : (
          <>
            {!onArc ? (
              <div className="mt-8 flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  $AMG lives on Arc (chain 5042). You&apos;re on{" "}
                  {chainLabel(chainId)}.
                </p>
                <Button
                  size="sm"
                  disabled={switching}
                  onClick={async () => {
                    setSwitching(true);
                    try {
                      await switchToArc();
                      toast.success("Switched to Arc");
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Could not switch",
                      );
                    } finally {
                      setSwitching(false);
                    }
                  }}
                >
                  {switching ? "Switching…" : "Switch to Arc"}
                </Button>
              </div>
            ) : null}

            {loading && !data ? (
              <div className="mt-10 h-48 animate-pulse rounded-xl bg-surface" />
            ) : (
              <>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <Stat
                    label="$AMG held"
                    value={formatToken(data?.amgHeld ?? 0)}
                    hint={launched ? "On-chain balance" : "Contract not live yet"}
                  />
                  <Stat
                    label="Total USDC distributed to you"
                    value={`$${formatUsdc(data?.earnedUsdc ?? 0)}`}
                    hint="Lifetime reflections, including auto-pushed"
                  />
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <section className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
                    <h2 className="font-display text-lg font-semibold">
                      {launched ? "Live on Arc" : "Pre-launch"}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {launched
                        ? "Numbers come from the Instant Reflection contract on Arc. The arcfun keeper pushes USDC to holders automatically."
                        : "$AMG has not launched yet. The contract address will be wired after the Instant Reflection create on arcfun.co. Your wallet stays connected — bag and rewards appear the second it goes live."}
                    </p>
                    <dl className="mt-6 space-y-3 text-sm">
                      <Row
                        k="Claimed / pushed"
                        v={`$${formatUsdc(data?.claimedUsdc ?? 0)}`}
                      />
                      <Row
                        k="Unclaimed"
                        v={`$${formatUsdc(claimable)}`}
                      />
                      <Row k="Network" v="Arc · 5042" />
                      {data?.token ? (
                        <Row
                          k="Contract"
                          v={
                            <a
                              className="text-primary hover:underline"
                              href={explorerAddressUrl(data.token)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {shortenAddress(data.token)}
                            </a>
                          }
                        />
                      ) : (
                        <Row k="Contract" v="Pending launch" />
                      )}
                    </dl>
                    {error ? (
                      <p className="mt-4 text-sm text-muted" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </section>

                  <section className="flex flex-col rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
                    <h2 className="font-display text-lg font-semibold">Claim</h2>
                    <p className="mt-1 text-sm text-muted">
                      Backup pull if any USDC is sitting unclaimed for{" "}
                      {shortenAddress(address)}.
                    </p>
                    <p className="mt-8 font-display text-4xl font-semibold tabular-nums">
                      ${formatUsdc(claimable)}
                    </p>
                    <p className="mt-1 text-xs text-faint">Available now</p>
                    <Button
                      className="mt-auto min-h-12"
                      disabled={!launched || !data?.token || claimable <= 0 || claiming}
                      onClick={async () => {
                        if (!data?.token) return;
                        setClaiming(true);
                        try {
                          if (!onArc) await switchToArc();
                          const hash = await claimAmgRewards(data.token, address);
                          toast.success(`Claim submitted ${hash.slice(0, 10)}…`);
                        } catch (err) {
                          toast.error(
                            err instanceof Error ? err.message : "Claim failed",
                          );
                        } finally {
                          setClaiming(false);
                        }
                      }}
                    >
                      {!launched
                        ? "Waiting on launch"
                        : claimable <= 0
                          ? "Nothing to claim"
                          : claiming
                            ? "Claiming…"
                            : "Claim USDC"}
                    </Button>
                    <div className="mt-3 flex flex-col gap-1">
                      <a
                        href={data?.buyUrl ?? "https://arcfun.co"}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-10 text-center text-sm text-muted hover:text-fg"
                      >
                        Buy $AMG on arcfun.co
                      </a>
                      <button
                        type="button"
                        className="min-h-10 text-sm text-muted hover:text-fg"
                        onClick={openModal}
                      >
                        Switch wallet
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[0.65rem] tracking-[0.18em] text-faint uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-xs text-faint">{hint}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
